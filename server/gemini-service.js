/**
 * Starline Adventures — Server-Side Google Gemini AI Service
 * Uses @google/genai SDK with verified Starline Knowledge Base,
 * multi-turn conversation history, multilingual matching, and robust error handling.
 */

const { GoogleGenAI, ThinkingLevel } = require('@google/genai');
const { buildVerifiedKnowledgeText } = require('./knowledge-base');

const DEFAULT_MODEL = 'gemini-3.1-flash-lite';
const REQUEST_TIMEOUT_MS = 45000;
const MAX_HISTORY_TURNS = 12;
const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_ITEM_CHARS = 1500;

function buildSystemInstruction() {
  const knowledgeText = buildVerifiedKnowledgeText();

  return `You are Starline AI, the intelligent Adventure AI & Sales Assistant for Starline Adventures Pvt Ltd (headquartered in Nagpur, Maharashtra, India).

=== YOUR ROLE & CORE PRINCIPLES ===
1. REAL AI ASSISTANT FIRST:
   - Understand natural language, user intent, and follow-up references across turns.
   - Always answer the user's actual question thoroughly and helpfully FIRST before offering optional next steps (Request Quote, WhatsApp Sales, Call Sales).
   - NEVER evade questions with generic replies like "Please contact us on WhatsApp" or "We received your message."

2. THREE-CATEGORY TRUTHFULNESS (CRITICAL — NEVER VIOLATE):
   Category A — Verified Starline Information:
     Use ONLY facts explicitly confirmed in the Verified Starline Knowledge Base below (activities, equipment, specs, projects, Nagpur plant, 6-phase workflow, 6M/1Y service warranty terms, team, contact details).
   Category B — General Industry Information:
     When users ask general conceptual, technical, safety, or planning questions (e.g., "What is a zipline?", "How does bungee jumping work?", "How to plan a water park?", "What safety norms apply to rope courses?"), provide clear, accurate, educational industry knowledge.
   Category C — Unverified Company-Specific Information:
     If the user asks about exact prices, custom dimensions, unlisted activities (e.g., water slides, roller coasters, Ferris wheels, wave pools), unlisted certifications, custom warranties, or delivery timelines not in the Verified Knowledge Base:
     - Do NOT invent prices, fake specs, or claim Starline manufactures unverified items.
     - Share helpful general industry guidance where useful.
     - Clearly state which specific Starline details (feasibility, exact pricing, or custom fabrication) need confirmation from Starline's engineering or sales team.
     - Never mix general AI estimates with verified Starline claims.

3. CONVERSATION MEMORY & CONTEXT:
   - Maintain full context across turns within the conversation (e.g., if the user says "I want to build a water park" and later asks "What activities should I include?" or "What will it cost?", understand "it" refers to that water park project).
   - Never fabricate details the user hasn't shared.

4. MULTILINGUAL & SCRIPT MATCHING SUPPORT:
   - Automatically detect and reply naturally in the exact language AND script the user writes in:
     * English -> English
     * Hindi (Devanagari script, e.g., "मुझे पार्क बनाना है") -> Hindi in Devanagari script
     * Hinglish (Hindi/English written in Roman/Latin letters, e.g., "Zipline kya hoti hai?") -> Hinglish in Roman/Latin letters ONLY (do NOT switch to Devanagari script)
     * Marathi (Devanagari or Roman Marathi) -> Marathi matching the user's script
   - Never force English if the user writes in Hindi, Hinglish, or Marathi.

5. SALES ASSISTANT & PROJECT CONSULTANT MODE:
   - Recognize visitor types (resorts, hotels, adventure parks, water parks, indoor entertainment zones, schools/colleges, builders, architects, government/forest tourism, agro-tourism, landowners).
   - When planning a project (e.g., "I have 2 acres of land" or "Which activities suit a resort?"):
     * Recommend suitable activity mixes based on space, target audience, throughput, and safety zones.
     * Explain why each fits.
     * Ask 1 to 2 natural follow-up questions at a time (e.g., project location, terrain/indoor-outdoor, target audience, or timeline) — do NOT bombard with a long questionnaire.
     * Clearly note that space/capacity suggestions are preliminary estimates only and final structural design, tower heights, and foundations require an on-site engineering feasibility survey.
   - Never present AI-generated dimensions or structural numbers as approved engineering designs.

6. RESPONSE STYLE:
   - Clear, structured, warm, and concise by default; expand with detail when technical or planning questions warrant it.
   - Use plain readable formatting (short paragraphs and clean bullet points). Do not output raw HTML tags.
   - When contact info is relevant: Phone +91-94249-04000 / +91-9421-244-244, Email starlineadventure@gmail.com, Office Nagpur – 441302.

${knowledgeText}`;
}

const SYSTEM_INSTRUCTION = buildSystemInstruction();

function getConfiguredModel() {
  const envModel = (process.env.GEMINI_MODEL || '').trim();
  return envModel || DEFAULT_MODEL;
}

function sanitizeHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) return [];

  const cleaned = [];
  for (const item of rawHistory) {
    if (!item || typeof item !== 'object') continue;
    const rawRole = String(item.role || '').toLowerCase().trim();
    const text = String(item.text || '').trim();
    if (!text) continue;
    // Skip transient UI error or typing placeholders
    if (item.isError || item.isTyping) continue;

    const role = rawRole === 'user' ? 'user' : 'model';
    const boundedText = text.slice(0, MAX_HISTORY_ITEM_CHARS);

    // Ensure strict alternating user/model messages if consecutive same-role messages exist
    if (cleaned.length > 0 && cleaned[cleaned.length - 1].role === role) {
      cleaned[cleaned.length - 1].parts[0].text += '\n' + boundedText;
    } else {
      cleaned.push({
        role,
        parts: [{ text: boundedText }]
      });
    }
  }

  // Keep only recent turns and ensure history starts with 'user' if non-empty
  const sliced = cleaned.slice(-MAX_HISTORY_TURNS);
  while (sliced.length > 0 && sliced[0].role !== 'user') {
    sliced.shift();
  }
  return sliced;
}

function classifyGeminiError(err) {
  const rawMessage = String((err && (err.message || err.toString())) || 'Unknown AI service error');
  const lower = rawMessage.toLowerCase();
  const status = Number(err && (err.status || err.statusCode || err.code)) || 0;

  if (rawMessage === 'GEMINI_TIMEOUT' || lower.includes('timed out') || lower.includes('timeout')) {
    return {
      httpStatus: 504,
      code: 'TIMEOUT',
      retryable: true,
      userMessage: 'The AI assistant took too long to respond. Please try again.'
    };
  }

  if (status === 400 && (lower.includes('api key') || lower.includes('api_key_invalid'))) {
    return {
      httpStatus: 503,
      code: 'INVALID_API_KEY',
      retryable: false,
      userMessage: 'The AI service configuration needs attention (invalid API key). Please contact support or retry later.'
    };
  }

  if (status === 403 || lower.includes('permission_denied') || lower.includes('api_key_invalid')) {
    return {
      httpStatus: 503,
      code: 'INVALID_API_KEY',
      retryable: false,
      userMessage: 'The AI assistant is currently unavailable due to an API authorization issue.'
    };
  }

  if (status === 429 || lower.includes('resource_exhausted') || lower.includes('quota') || lower.includes('rate limit')) {
    return {
      httpStatus: 429,
      code: 'RATE_LIMITED',
      retryable: true,
      userMessage: 'The AI assistant is receiving high demand right now. Please wait a moment and retry.'
    };
  }

  if (status === 404 || lower.includes('not_found') || lower.includes('model')) {
    return {
      httpStatus: 502,
      code: 'MODEL_NOT_FOUND',
      retryable: false,
      userMessage: 'The configured AI model is currently unavailable. Please try again later.'
    };
  }

  if (status === 503 || status === 502 || status === 500 || lower.includes('unavailable') || lower.includes('overloaded') || lower.includes('econnreset') || lower.includes('fetch failed')) {
    return {
      httpStatus: 503,
      code: 'SERVICE_UNAVAILABLE',
      retryable: true,
      userMessage: 'The AI service is temporarily busy. Please retry in a few seconds.'
    };
  }

  return {
    httpStatus: 502,
    code: 'GEMINI_ERROR',
    retryable: true,
    userMessage: 'Unable to generate an AI response right now. Please try again.'
  };
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), ms);
    promise.then(
      val => {
        clearTimeout(timer);
        resolve(val);
      },
      err => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function callGeminiWithRetry(ai, model, contents) {
  const maxAttempts = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const isGemini4 = model.startsWith('gemini-4-');
      const thinkingLevel = isGemini4 ? ThinkingLevel.LOW : ThinkingLevel.MINIMAL;
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            thinkingConfig: { thinkingLevel }
          }
        }),
        REQUEST_TIMEOUT_MS
      );

      const text = response && typeof response.text === 'string' ? response.text.trim() : '';
      if (!text) {
        const emptyErr = new Error('Empty response received from Gemini model');
        emptyErr.code = 'EMPTY_RESPONSE';
        throw emptyErr;
      }

      return text;
    } catch (err) {
      lastError = err;
      const classified = classifyGeminiError(err);
      const shouldRetry = attempt < maxAttempts && classified.retryable && classified.code === 'SERVICE_UNAVAILABLE';
      if (shouldRetry) {
        await new Promise(r => setTimeout(r, 600 * attempt));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

async function generateChatReply({ message, history = [], sessionId = '' }) {
  const cleanMessage = String(message || '').trim().slice(0, MAX_MESSAGE_CHARS);
  if (!cleanMessage) {
    return {
      ok: false,
      httpStatus: 400,
      code: 'INVALID_INPUT',
      retryable: false,
      error: 'Please enter a message before sending.'
    };
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return {
      ok: false,
      httpStatus: 503,
      code: 'MISSING_API_KEY',
      retryable: false,
      error: 'AI assistant is not configured on the server (missing GEMINI_API_KEY).'
    };
  }

  const model = getConfiguredModel();
  const sanitizedHistory = sanitizeHistory(history);

  // Merge user turn cleanly if history ends with 'user'
  const contents = [...sanitizedHistory];
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1] = {
      role: 'user',
      parts: [{ text: `${contents[contents.length - 1].parts[0].text}\n${cleanMessage}` }]
    };
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: cleanMessage }]
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const reply = await callGeminiWithRetry(ai, model, contents);
    return {
      ok: true,
      httpStatus: 200,
      reply,
      model,
      sessionId: sessionId || undefined
    };
  } catch (err) {
    if (err && err.code === 'EMPTY_RESPONSE') {
      return {
        ok: false,
        httpStatus: 502,
        code: 'EMPTY_RESPONSE',
        retryable: true,
        error: 'The AI assistant returned an empty response. Please try rephrasing or retrying.'
      };
    }

    const classified = classifyGeminiError(err);
    console.error(`[Gemini Service Error] [${classified.code}] (session=${sessionId || 'anon'}):`, err && err.message ? err.message : err);
    return {
      ok: false,
      httpStatus: classified.httpStatus,
      code: classified.code,
      retryable: classified.retryable,
      error: classified.userMessage
    };
  }
}

module.exports = {
  generateChatReply,
  getConfiguredModel,
  sanitizeHistory
};
