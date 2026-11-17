/**
 * Starline Adventures Pvt. Ltd. - AI Website Chatbot & Lead Generation Backend
 * Endpoints:
 *   GET  /api/chatbot/status
 *   GET  /api/chatbot/health
 *   POST /api/chatbot/message
 *   POST /api/chatbot/leads
 *   GET  /api/chatbot/leads (Admin protected)
 */

require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const ROOT_DIR = path.resolve(__dirname, '..');
const CHATBOT_STORE_DIR = path.join(ROOT_DIR, '.secure_store');
const CHATBOT_STORE_FILE = path.join(CHATBOT_STORE_DIR, 'chatbot_leads.json');

const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite').trim();

// ============================================================
// 1. VERIFIED COMPANY KNOWLEDGE & SYSTEM INSTRUCTIONS
// ============================================================
const STARLINE_SYSTEM_INSTRUCTION = `You are the official multilingual AI Website Assistant for STARLINE ADVENTURES PVT. LTD. (https://starlineadventure.com/), an adventure equipment manufacturer and installation specialist serving projects across India.

STRICT LANGUAGE & TONE RULES:
1. Automatically detect the user's language and script from their latest message (English, Hindi in Devanagari, Marathi in Devanagari, mixed Hindi-English / Hinglish in Roman script, or any other language).
2. Always reply naturally, warmly, concisely, and professionally in the SAME language and script style the user used.
3. Keep responses scannable, practical, and focused (typically 2-5 short sentences or clean bullet points).

VERIFIED COMPANY KNOWLEDGE (ONLY USE THESE FACTS — NEVER INVENT ANYTHING ELSE):
- Company Name: STARLINE ADVENTURES PVT. LTD.
- Location: Opposite Government Guest House, Saraswati Nagar, Laxmi Nagar, Nagpur – 441302, Maharashtra, India.
- Business Activities: Adventure equipment design, manufacturing, supply, professional installation, and adventure park equipment solutions across India.
- Equipment & Activities Manufactured/Supplied:
  * Zipline (including Mini Zipline)
  * Giant Swing
  * Rope Course & Low Rope Course
  * Ninja Obstacle Course
  * Climbing Wall
  * A Shape Net Climbing
  * Tyre Wall
  * Open Gym Equipment
  * Safety Nets
  * Safety Harness and Belts
  * Zipline Safety Equipment
  (Also supports turnkey multi-activity adventure setups such as sky cycling, sky roller, multi-activity towers, suspension/glass bridges, and recreational park installations listed on the website.)
- Target Customers: Resorts, adventure parks, builders and developers, architects, tourism destinations, educational institutions, and government tourism projects.
- Notable Completed Project: Devgad Beach Zipline, Sindhudurg, Maharashtra — Length: 1,885 feet (approximately 575 metres). Highlight: India's first coastal zipline and Maharashtra's longest zipline, as described by the company.
- Official Contact Details:
  * Website: https://starlineadventure.com/
  * Phone / WhatsApp: +91 94249 04000 (https://wa.me/919424904000)
  * Email: starlineadventure@gmail.com
  * Instagram: https://instagram.com/starline.adventure

STRICT BUSINESS GUARDRAILS (NEVER VIOLATE):
- Starline Adventures is a manufacturer and installer of adventure rides & equipment, NOT necessarily a complete water park operator. Clarify this politely if asked about water parks.
- NEVER invent product prices, budgets, or cost estimates. For pricing/cost questions, explain that pricing depends on project requirements, site terrain, span/structure, and chosen activities, and invite the customer to share their requirements for a custom quotation.
- NEVER invent technical specifications, exact load capacities, wire rope thicknesses, or third-party certifications that are not confirmed here.
- NEVER promise fixed delivery or installation timelines without engineering confirmation.
- If you do not know a specific detail, state honestly that it requires confirmation from Starline's engineering/sales team and offer to connect them via the enquiry form, WhatsApp (+91 94249 04000), or email (starlineadventure@gmail.com).

CONVERSATIONAL LEAD QUALIFICATION:
- When a visitor expresses project interest, asks for a quotation, wants to develop an adventure park, or wants to contact sales:
  1. Be helpful and ask 1 to 2 natural clarifying questions (without overwhelming them) about what they need: Full Name, Company / Organisation, Phone Number, Email Address, Project Location, Project Type (e.g., resort, adventure park, school, government project), Required Activities / Equipment, or Expected Project Timeline.
  2. Set "shouldOfferLeadForm" to true whenever the user wants a quotation, wants to plan/develop a project, or asks to contact/speak with sales so they can submit the structured enquiry form with consent.
  3. Extract any lead details the user has already shared in this conversation into "extractedLead". Leave unmentioned fields as empty strings "".
  4. If the user asks for human support, a callback, WhatsApp, or direct contact, set "escalateToHuman" to true.
  5. Provide 2 to 3 short, helpful "suggestedReplies" in the user's detected language.`;

// ============================================================
// 2. HELPERS: SANITIZATION, RATE LIMITING, SESSION CONTEXT
// ============================================================
function sanitizeText(val, maxLen = 500) {
  if (val === null || val === undefined) return '';
  return String(val).replace(/[<>]/g, '').trim().slice(0, maxLen);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

// Message rate limiter: 30 requests per 5 minutes per IP
const chatMessageRateMap = new Map();
const CHAT_WINDOW_MS = 5 * 60 * 1000;
const CHAT_MAX_REQUESTS = 30;

// Lead submission rate limiter: 5 requests per 10 minutes per IP
const chatLeadRateMap = new Map();
const LEAD_WINDOW_MS = 10 * 60 * 1000;
const LEAD_MAX_REQUESTS = 5;

function checkRateLimit(map, ip, windowMs, maxReq) {
  const now = Date.now();
  const list = (map.get(ip) || []).filter(ts => now - ts < windowMs);
  if (list.length >= maxReq) return false;
  list.push(now);
  map.set(ip, list);
  return true;
}

// Server-side conversation context store (TTL 60 minutes, max 20 turns per session)
const chatSessions = new Map();
const SESSION_TTL_MS = 60 * 60 * 1000;
const MAX_SESSION_TURNS = 20;

// Lead deduplication store (2 minute window)
const recentLeadFingerprints = new Map();
const LEAD_DUP_WINDOW_MS = 2 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [sid, session] of chatSessions.entries()) {
    if (now - session.updatedAt > SESSION_TTL_MS) {
      chatSessions.delete(sid);
    }
  }
  for (const [ip, list] of chatMessageRateMap.entries()) {
    const valid = list.filter(ts => now - ts < CHAT_WINDOW_MS);
    if (valid.length === 0) chatMessageRateMap.delete(ip);
    else chatMessageRateMap.set(ip, valid);
  }
  for (const [ip, list] of chatLeadRateMap.entries()) {
    const valid = list.filter(ts => now - ts < LEAD_WINDOW_MS);
    if (valid.length === 0) chatLeadRateMap.delete(ip);
    else chatLeadRateMap.set(ip, valid);
  }
  for (const [fp, data] of recentLeadFingerprints.entries()) {
    if (now - data.timestamp > LEAD_DUP_WINDOW_MS) {
      recentLeadFingerprints.delete(fp);
    }
  }
}, 5 * 60 * 1000);

// ============================================================
// 3. LOCAL BACKUP STORE FOR CHATBOT LEADS
// ============================================================
function ensureStore() {
  try {
    if (!fs.existsSync(CHATBOT_STORE_DIR)) {
      fs.mkdirSync(CHATBOT_STORE_DIR, { mode: 0o700, recursive: true });
    }
    if (!fs.existsSync(CHATBOT_STORE_FILE)) {
      fs.writeFileSync(CHATBOT_STORE_FILE, '[]', { encoding: 'utf8', mode: 0o600 });
    }
  } catch (err) {
    console.warn('[Chatbot Store Notice]:', err.message);
  }
}

function saveChatbotLeadLocally(record) {
  try {
    ensureStore();
    let list = [];
    if (fs.existsSync(CHATBOT_STORE_FILE)) {
      list = JSON.parse(fs.readFileSync(CHATBOT_STORE_FILE, 'utf8') || '[]');
    }
    list.unshift(record);
    if (list.length > 500) list = list.slice(0, 500);
    fs.writeFileSync(CHATBOT_STORE_FILE, JSON.stringify(list, null, 2), { encoding: 'utf8', mode: 0o600 });
  } catch (err) {
    console.error('[Chatbot Store Write Error]:', err.message);
  }
}

function getStoredChatbotLeads() {
  try {
    if (fs.existsSync(CHATBOT_STORE_FILE)) {
      return JSON.parse(fs.readFileSync(CHATBOT_STORE_FILE, 'utf8') || '[]');
    }
  } catch (err) {
    console.error('[Chatbot Store Read Error]:', err.message);
  }
  return [];
}

// ============================================================
// 4. GEMINI CLIENT LOADER (@google/genai)
// ============================================================
let genaiSdkCache = null;

async function getGenAISdk() {
  if (!genaiSdkCache) {
    genaiSdkCache = await import('@google/genai');
  }
  return genaiSdkCache;
}

function getGeminiClient(GoogleGenAI) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 25000,
      retryOptions: { attempts: 1 },
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// ============================================================
// 5. LEAD ID & EMAIL DISPATCH HELPERS
// ============================================================
function generateLeadId(date = new Date()) {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(6);
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars[bytes[i] % chars.length];
  }
  return `LEAD-${yyyy}${mm}${dd}-${rand}`;
}

async function generateUniqueLeadId(firebaseConfig, db, getDocFn, docFn) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateLeadId();
    const localList = getStoredChatbotLeads();
    if (localList.some(item => item.id === candidate)) continue;

    if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey) {
      try {
        const checkUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/website_chatbot_leads/${encodeURIComponent(candidate)}?key=${firebaseConfig.apiKey}`;
        const res = await fetch(checkUrl, { method: 'GET' });
        if (res.ok) continue;
      } catch (e) {}
    } else if (db && getDocFn && docFn) {
      try {
        const snap = await getDocFn(docFn(db, 'website_chatbot_leads', candidate));
        if (snap && snap.exists()) continue;
      } catch (e) {}
    }
    return candidate;
  }
  return generateLeadId();
}

function getEmailCredentials() {
  let user = (process.env.EMAIL_USER || '').trim();
  let pass = (process.env.EMAIL_APP_PASSWORD || '').trim();
  if (pass.includes('@') && !user.includes('@')) {
    const tmp = user;
    user = pass;
    pass = tmp;
  }
  if (!user || !user.includes('@')) {
    user = 'starlineadventure@gmail.com';
  }
  const cleanPass = pass.replace(/\s+/g, '');
  return {
    user,
    pass: cleanPass,
    hasPassword: cleanPass.length > 0,
    targetRecipient: 'starlineadventure@gmail.com'
  };
}

async function sendChatbotLeadNotification(record) {
  const { user, pass, hasPassword, targetRecipient } = getEmailCredentials();
  if (!hasPassword) {
    console.warn(`[Chatbot Email Notice]: EMAIL_APP_PASSWORD not configured. Lead [${record.id}] stored; email skipped.`);
    return { sent: false, reason: 'EMAIL_APP_PASSWORD not configured' };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  const istTime = new Date(record.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const cleanPhone = (record.phone || '').replace(/[^\d+]/g, '');
  const subject = `New AI Chatbot Business Lead [${record.id}] - Starline Adventures`;

  const plainText = [
    'New qualified lead captured via Starline AI Website Assistant.',
    '',
    `Lead ID: ${record.id}`,
    `Full Name: ${record.fullName}`,
    `Company / Organisation: ${record.company || 'Not specified'}`,
    `Phone: ${record.phone}`,
    `Email: ${record.email}`,
    `Project Location: ${record.projectLocation || 'Not specified'}`,
    `Project Type: ${record.projectType || 'Not specified'}`,
    `Required Activities / Equipment: ${record.requiredEquipment || 'Not specified'}`,
    `Expected Project Timeline: ${record.expectedTimeline || 'Not specified'}`,
    `Detected Language: ${record.language || 'en'}`,
    `Consent Given: ${record.consentGiven ? 'Yes' : 'No'}`,
    `Source Page: ${record.sourcePage}`,
    `Timestamp (IST): ${istTime}`,
    '',
    'Notes / Requirements:',
    record.notes || 'None provided',
    '',
    'Conversation Summary:',
    record.conversationSummary || 'None'
  ].join('\n');

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:24px;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#171717;">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#171717;padding:24px;text-align:center;border-bottom:4px solid #F47621;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;letter-spacing:0.5px;">STARLINE AI ASSISTANT</h1>
      <p style="margin:6px 0 0;color:#F47621;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Qualified Website Chatbot Lead</p>
    </div>
    <div style="padding:24px;">
      <div style="background:#fff7ed;border-left:4px solid #F47621;padding:12px 16px;border-radius:6px;margin-bottom:20px;font-size:14px;">
        <strong>Lead Reference:</strong> ${escapeHtml(record.id)} &bull; <strong>Source:</strong> ${escapeHtml(record.sourcePage)}
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 6px;color:#64748b;font-weight:700;width:180px;">Full Name</td><td style="padding:8px 6px;"><strong>${escapeHtml(record.fullName)}</strong></td></tr>
        <tr><td style="padding:8px 6px;color:#64748b;font-weight:700;">Company / Org</td><td style="padding:8px 6px;">${escapeHtml(record.company || 'Not specified')}</td></tr>
        <tr><td style="padding:8px 6px;color:#64748b;font-weight:700;">Phone Number</td><td style="padding:8px 6px;"><a href="tel:${escapeHtml(cleanPhone)}" style="color:#171717;font-weight:700;text-decoration:none;">${escapeHtml(record.phone)}</a></td></tr>
        <tr><td style="padding:8px 6px;color:#64748b;font-weight:700;">Email Address</td><td style="padding:8px 6px;"><a href="mailto:${escapeHtml(record.email)}" style="color:#F47621;font-weight:600;text-decoration:none;">${escapeHtml(record.email)}</a></td></tr>
        <tr><td style="padding:8px 6px;color:#64748b;font-weight:700;">Project Location</td><td style="padding:8px 6px;">${escapeHtml(record.projectLocation || 'Not specified')}</td></tr>
        <tr><td style="padding:8px 6px;color:#64748b;font-weight:700;">Project Type</td><td style="padding:8px 6px;">${escapeHtml(record.projectType || 'Not specified')}</td></tr>
        <tr><td style="padding:8px 6px;color:#64748b;font-weight:700;">Activities / Equipment</td><td style="padding:8px 6px;color:#F47621;font-weight:700;">${escapeHtml(record.requiredEquipment || 'Not specified')}</td></tr>
        <tr><td style="padding:8px 6px;color:#64748b;font-weight:700;">Expected Timeline</td><td style="padding:8px 6px;">${escapeHtml(record.expectedTimeline || 'Not specified')}</td></tr>
        <tr><td style="padding:8px 6px;color:#64748b;font-weight:700;">Language</td><td style="padding:8px 6px;">${escapeHtml(record.language || 'en')}</td></tr>
        <tr><td style="padding:8px 6px;color:#64748b;font-weight:700;">Consent Given</td><td style="padding:8px 6px;">${record.consentGiven ? 'Yes (Verified)' : 'No'}</td></tr>
        <tr><td style="padding:8px 6px;color:#64748b;font-weight:700;">Timestamp (IST)</td><td style="padding:8px 6px;">${escapeHtml(istTime)}</td></tr>
      </table>
      ${record.notes ? `<div style="margin-top:16px;"><div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Customer Notes</div><div style="margin-top:6px;padding:12px;background:#f7f7f7;border-left:4px solid #F47621;border-radius:6px;white-space:pre-wrap;font-size:14px;">${escapeHtml(record.notes)}</div></div>` : ''}
      ${record.conversationSummary ? `<div style="margin-top:16px;"><div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">AI Chat Context Summary</div><div style="margin-top:6px;padding:12px;background:#f7f7f7;border:1px solid #e5e7eb;border-radius:6px;white-space:pre-wrap;font-size:13px;">${escapeHtml(record.conversationSummary)}</div></div>` : ''}
      <div style="margin-top:24px;text-align:center;">
        <a href="mailto:${escapeHtml(record.email)}?subject=Re:%20Starline%20Adventures%20Enquiry%20[${encodeURIComponent(record.id)}]" style="display:inline-block;padding:10px 18px;background:#171717;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:700;font-size:13px;margin:4px;">Reply via Email</a>
        ${cleanPhone ? `<a href="https://wa.me/${cleanPhone.replace('+', '')}" style="display:inline-block;padding:10px 18px;background:#25D366;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:700;font-size:13px;margin:4px;">Message on WhatsApp</a>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;

  const info = await transporter.sendMail({
    from: `"Starline AI Assistant" <${user}>`,
    to: targetRecipient,
    replyTo: record.email,
    subject,
    text: plainText,
    html: htmlBody
  });

  return { sent: true, messageId: info.messageId, recipient: targetRecipient };
}

// ============================================================
// 6. ROUTER FACTORY
// ============================================================
function createChatbotRouter({ firebaseConfig, db, firestoreFns, requireAdminAuth }) {
  const router = express.Router();

  // ------------------------------------------------------------
  // GET /api/chatbot/status (Public boolean readiness, no secrets)
  // ------------------------------------------------------------
  router.get('/status', (req, res) => {
    return res.json({
      ok: true,
      aiConfigured: Boolean((process.env.GEMINI_API_KEY || '').trim()),
      model: GEMINI_MODEL,
      firestoreConfigured: Boolean(firebaseConfig && firebaseConfig.projectId),
      emailConfigured: getEmailCredentials().hasPassword
    });
  });

  // ------------------------------------------------------------
  // GET /api/chatbot/health (Makes a test AI call)
  // ------------------------------------------------------------
  router.get('/health', async (req, res) => {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    const missingEnv = [];
    if (!apiKey) missingEnv.push('GEMINI_API_KEY');
    if (!GEMINI_MODEL) missingEnv.push('GEMINI_MODEL');

    if (missingEnv.length > 0) {
      console.error(`[Chatbot Health Check Error]: Missing environment variables: ${missingEnv.join(', ')}`);
      return res.status(503).json({
        ok: false,
        errorCode: 'config',
        reason: `Missing required environment variables: ${missingEnv.join(', ')}`,
        missingEnv
      });
    }

    try {
      const sdk = await getGenAISdk();
      const ai = new sdk.GoogleGenAI({
        apiKey,
        httpOptions: { timeout: 15000, retryOptions: { attempts: 1 } }
      });

      const tryGenerate = async (modelToTest) => {
        return await ai.models.generateContent({
          model: modelToTest,
          contents: 'Reply with JSON {"status": "ok"}',
          config: {
            responseMimeType: 'application/json',
            httpOptions: { timeout: 15000 }
          }
        });
      };

      let testRes;
      let usedModel = GEMINI_MODEL;
      try {
        testRes = await tryGenerate(GEMINI_MODEL);
      } catch (primaryHealthErr) {
        const pStatus = primaryHealthErr?.status || 500;
        const pMsg = primaryHealthErr?.message || '';
        if (pStatus === 503 || pStatus === 504 || pMsg.includes('UNAVAILABLE') || pMsg.includes('DEADLINE_EXCEEDED')) {
          usedModel = 'gemini-3.1-flash-lite';
          testRes = await tryGenerate(usedModel);
        } else {
          throw primaryHealthErr;
        }
      }

      const text = testRes?.text ? testRes.text.trim() : '';
      console.log(`[Chatbot Health Check Success]: Model ${usedModel} responded successfully.`);
      return res.json({ ok: true, model: usedModel, responsePreview: text.slice(0, 100) });
    } catch (healthErr) {
      const status = healthErr?.status || 500;
      const errMsg = healthErr?.message || 'Unknown error';
      console.error(`[Chatbot Health Check Failure]: Status ${status}, Message: ${errMsg}, Model: ${GEMINI_MODEL}`);

      let errorCode = 'server';
      if (status === 401 || status === 403 || errMsg.includes('API_KEY') || errMsg.includes('PERMISSION_DENIED')) {
        errorCode = 'auth';
      } else if (status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        errorCode = 'rate_limit';
      } else if (status === 504 || errMsg.includes('timeout') || errMsg.includes('DEADLINE_EXCEEDED')) {
        errorCode = 'timeout';
      }

      return res.status(status >= 400 && status < 600 ? status : 503).json({
        ok: false,
        errorCode,
        reason: errMsg,
        status
      });
    }
  });

  // ------------------------------------------------------------
  // POST /api/chatbot/message
  // ------------------------------------------------------------
  router.post('/message', async (req, res) => {
    const clientIp = getClientIp(req);
    if (!checkRateLimit(chatMessageRateMap, clientIp, CHAT_WINDOW_MS, CHAT_MAX_REQUESTS)) {
      return res.status(429).json({
        ok: false,
        errorCode: 'rate_limit',
        error: 'Too many chat requests. Please wait a moment or contact us directly on WhatsApp (+91 94249 04000).'
      });
    }

    const body = req.body || {};
    const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';
    if (!rawMessage || rawMessage.length < 1) {
      return res.status(400).json({ ok: false, errorCode: 'server', error: 'Message is required.' });
    }
    if (rawMessage.length > 1500) {
      return res.status(400).json({ ok: false, errorCode: 'server', error: 'Message exceeds 1,500 characters.' });
    }

    const sessionId = (typeof body.sessionId === 'string' && /^[a-zA-Z0-9_\-]{6,64}$/.test(body.sessionId.trim()))
      ? body.sessionId.trim()
      : `sess_${crypto.randomBytes(12).toString('hex')}`;

    const sourcePage = sanitizeText(body.sourcePage || req.headers.referer || 'Website', 300);

    // Check configuration environment variables
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    const missingEnv = [];
    if (!apiKey) missingEnv.push('GEMINI_API_KEY');
    if (!GEMINI_MODEL) missingEnv.push('GEMINI_MODEL');

    if (missingEnv.length > 0) {
      console.error(`[Chatbot Config Error]: Missing environment variables: ${missingEnv.join(', ')}. API key present: ${Boolean(apiKey)}`);
      return res.status(503).json({
        ok: false,
        errorCode: 'config',
        error: `AI assistant is not configured (missing: ${missingEnv.join(', ')}). Please set GEMINI_API_KEY in environment variables.`,
        fallbackContact: {
          phone: '+91 94249 04000',
          email: 'starlineadventure@gmail.com',
          whatsapp: 'https://wa.me/919424904000'
        }
      });
    }

    // Load or reconstruct bounded session conversation history
    let session = chatSessions.get(sessionId);
    if (!session) {
      session = { messages: [], updatedAt: Date.now(), hasShownFallbackCard: false };
      if (Array.isArray(body.history)) {
        for (const item of body.history.slice(-MAX_SESSION_TURNS)) {
          if (!item || typeof item !== 'object') continue;
          const role = item.role === 'model' || item.role === 'assistant' ? 'model' : 'user';
          const text = sanitizeText(item.text || '', 1500);
          if (text) {
            session.messages.push({ role, parts: [{ text }] });
          }
        }
      }
    }

    let ai;
    let Type;
    let ThinkingLevel;
    try {
      const sdk = await getGenAISdk();
      Type = sdk.Type;
      ThinkingLevel = sdk.ThinkingLevel;
      ai = getGeminiClient(sdk.GoogleGenAI);
    } catch (sdkErr) {
      console.error('[Chatbot SDK Load Error]:', sdkErr.message);
      return res.status(503).json({
        ok: false,
        errorCode: 'server',
        error: 'AI assistant service is temporarily unavailable. Please submit an enquiry form or contact us on WhatsApp.',
        fallbackContact: {
          phone: '+91 94249 04000',
          email: 'starlineadventure@gmail.com',
          whatsapp: 'https://wa.me/919424904000'
        }
      });
    }

    if (!ai) {
      console.error('[Chatbot Error]: Gemini client could not be initialized. GEMINI_API_KEY is missing or invalid.');
      return res.status(503).json({
        ok: false,
        errorCode: 'config',
        error: 'AI assistant is currently unconfigured. Please set GEMINI_API_KEY.',
        fallbackContact: {
          phone: '+91 94249 04000',
          email: 'starlineadventure@gmail.com',
          whatsapp: 'https://wa.me/919424904000'
        }
      });
    }

    const userContent = {
      role: 'user',
      parts: [{ text: `[Visitor is currently viewing: ${sourcePage}]\n${rawMessage}` }]
    };

    const contents = [...session.messages.slice(-MAX_SESSION_TURNS), userContent];

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        reply: {
          type: Type.STRING,
          description: 'Concise, helpful, professional response in the exact language and script used by the user.'
        },
        detectedLanguage: {
          type: Type.STRING,
          description: 'Short code or label such as en, hi, mr, hinglish, or other.'
        },
        intent: {
          type: Type.STRING,
          description: 'One of: general_info, equipment, project_planning, quotation, human_support, lead_collection.'
        },
        shouldOfferLeadForm: {
          type: Type.BOOLEAN,
          description: 'True when the visitor expresses project interest, asks for a quotation, or wants to contact sales.'
        },
        escalateToHuman: {
          type: Type.BOOLEAN,
          description: 'True when the visitor asks for human support, phone call, or WhatsApp contact.'
        },
        extractedLead: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            company: { type: Type.STRING },
            phone: { type: Type.STRING },
            email: { type: Type.STRING },
            projectLocation: { type: Type.STRING },
            projectType: { type: Type.STRING },
            requiredEquipment: { type: Type.STRING },
            expectedTimeline: { type: Type.STRING }
          }
        },
        suggestedReplies: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Up to 3 short follow-up prompt options in the user language.'
        }
      },
      required: ['reply', 'detectedLanguage', 'intent', 'shouldOfferLeadForm', 'escalateToHuman']
    };

    try {
      const callModelWithRetry = async (currentModel) => {
        const timeoutMs = 20000;
        const genConfig = {
          systemInstruction: STARLINE_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema,
          httpOptions: { timeout: timeoutMs, retryOptions: { attempts: 1 } }
        };
        if (ThinkingLevel) {
          genConfig.thinkingConfig = {
            thinkingLevel: currentModel.includes('flash')
              ? (ThinkingLevel.MINIMAL || ThinkingLevel.LOW)
              : ThinkingLevel.LOW
          };
        }

        const runAttempt = async () => {
          return await Promise.race([
            ai.models.generateContent({
              model: currentModel,
              contents,
              config: genConfig
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error(`AI request timeout after ${timeoutMs}ms`)), timeoutMs + 2000))
          ]);
        };

        try {
          return await runAttempt();
        } catch (firstErr) {
          const fMsg = firstErr?.message || '';
          const fStatus = firstErr?.status || 500;
          const isTransient = fStatus === 429 || fStatus >= 500 || fMsg.includes('timeout') || fMsg.includes('DEADLINE_EXCEEDED') || fMsg.includes('503') || fMsg.includes('504');
          if (!isTransient) throw firstErr;
          console.warn(`[Chatbot Warning]: Transient AI error on model ${currentModel} (HTTP ${fStatus}: ${fMsg}). Retrying once after 1s...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await runAttempt();
        }
      };

      let response;
      try {
        response = await callModelWithRetry(GEMINI_MODEL);
      } catch (primaryErr) {
        const pMsg = primaryErr?.message || '';
        const pStatus = primaryErr?.status || 500;
        console.error(`[Chatbot Primary Model Error]: Model ${GEMINI_MODEL} failed with HTTP ${pStatus}: ${pMsg}`);
        const fallbackModel = 'gemini-3.1-flash-lite';
        if (GEMINI_MODEL !== fallbackModel) {
          console.warn(`[Chatbot Fallback]: Trying fallback model ${fallbackModel}...`);
          response = await callModelWithRetry(fallbackModel);
        } else {
          throw primaryErr;
        }
      }

      const rawText = (response && response.text ? response.text : '').trim();
      let parsed = null;
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        parsed = {
          reply: rawText || 'Thank you for contacting Starline Adventures. How can I assist with your adventure project?',
          detectedLanguage: 'en',
          intent: 'general_info',
          shouldOfferLeadForm: false,
          escalateToHuman: false,
          extractedLead: {},
          suggestedReplies: []
        };
      }

      const replyText = String(parsed.reply || '').trim();
      if (!replyText) {
        throw new Error('Empty response from Gemini model');
      }

      // Persist clean turn in session memory
      session.messages.push({ role: 'user', parts: [{ text: rawMessage }] });
      session.messages.push({ role: 'model', parts: [{ text: replyText }] });
      if (session.messages.length > MAX_SESSION_TURNS * 2) {
        session.messages = session.messages.slice(-MAX_SESSION_TURNS * 2);
      }
      session.updatedAt = Date.now();
      chatSessions.set(sessionId, session);

      const showFallbackCard = !session.hasShownFallbackCard;

      return res.json({
        ok: true,
        sessionId,
        reply: replyText,
        detectedLanguage: sanitizeText(parsed.detectedLanguage || 'en', 40),
        intent: sanitizeText(parsed.intent || 'general_info', 40),
        shouldOfferLeadForm: Boolean(parsed.shouldOfferLeadForm),
        escalateToHuman: Boolean(parsed.escalateToHuman),
        showFallbackCard,
        extractedLead: parsed.extractedLead && typeof parsed.extractedLead === 'object' ? {
          fullName: sanitizeText(parsed.extractedLead.fullName || '', 100),
          company: sanitizeText(parsed.extractedLead.company || '', 120),
          phone: sanitizeText(parsed.extractedLead.phone || '', 30),
          email: sanitizeText(parsed.extractedLead.email || '', 120),
          projectLocation: sanitizeText(parsed.extractedLead.projectLocation || '', 120),
          projectType: sanitizeText(parsed.extractedLead.projectType || '', 100),
          requiredEquipment: sanitizeText(parsed.extractedLead.requiredEquipment || '', 500),
          expectedTimeline: sanitizeText(parsed.extractedLead.expectedTimeline || '', 100)
        } : {},
        suggestedReplies: Array.isArray(parsed.suggestedReplies)
          ? parsed.suggestedReplies.slice(0, 3).map(s => sanitizeText(s, 80)).filter(Boolean)
          : []
      });
    } catch (aiErr) {
      const errMsg = aiErr && aiErr.message ? aiErr.message : 'AI service error';
      const status = aiErr?.status || 503;
      console.error(`[Chatbot AI Call Failure]: HTTP Status ${status}, Provider Error: ${errMsg}, Model: ${GEMINI_MODEL}, MissingEnv: ${missingEnv.join(', ')}`);

      let errorCode = 'server';
      if (status === 401 || status === 403 || errMsg.includes('API_KEY') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('auth')) {
        errorCode = 'auth';
      } else if (status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        errorCode = 'rate_limit';
      } else if (status === 504 || errMsg.includes('timeout') || errMsg.includes('DEADLINE_EXCEEDED')) {
        errorCode = 'timeout';
      } else if (!apiKey) {
        errorCode = 'config';
      }

      const showFallbackCard = !session.hasShownFallbackCard;
      if (showFallbackCard) {
        session.hasShownFallbackCard = true;
        chatSessions.set(sessionId, session);
      }

      const errorMessages = {
        config: 'AI assistant is not configured. Please check GEMINI_API_KEY.',
        auth: 'AI authentication error. Please verify your Gemini API key permissions.',
        rate_limit: 'Our AI assistant is experiencing high demand right now. Please try again shortly.',
        timeout: 'AI request timed out. Please try again.',
        server: 'Our AI assistant is temporarily unavailable. You can try again or reach our team on WhatsApp.'
      };

      return res.status(status >= 400 && status < 600 ? status : 503).json({
        ok: false,
        errorCode,
        error: errorMessages[errorCode] || errorMessages.server,
        showFallbackCard,
        fallbackContact: {
          phone: '+91 94249 04000',
          email: 'starlineadventure@gmail.com',
          whatsapp: 'https://wa.me/919424904000'
        }
      });
    }
  });

  // ------------------------------------------------------------
  // POST /api/chatbot/leads
  // ------------------------------------------------------------
  router.post('/leads', async (req, res) => {
    try {
      const body = req.body || {};

      // 1. Honeypot check
      if (body.website_hp || body.confirm_email) {
        return res.json({
          ok: true,
          leadId: generateLeadId(),
          message: 'Thank you! Your enquiry has been received.'
        });
      }

      // 2. Rate limiting
      const clientIp = getClientIp(req);
      if (!checkRateLimit(chatLeadRateMap, clientIp, LEAD_WINDOW_MS, LEAD_MAX_REQUESTS)) {
        return res.status(429).json({
          ok: false,
          error: 'Too many enquiry submissions. Please wait a few minutes before submitting again.'
        });
      }

      // 3. Validate & sanitize inputs (matching firebase-blueprint.json bounds)
      const fullName = sanitizeText(body.fullName || body.name, 100);
      const company = sanitizeText(body.company, 120);
      const phone = sanitizeText(body.phone, 30);
      const email = String(body.email || '').trim().toLowerCase().slice(0, 120);
      const projectLocation = sanitizeText(body.projectLocation || body.location, 120);
      const projectType = sanitizeText(body.projectType, 100);
      const requiredEquipment = sanitizeText(body.requiredEquipment || body.equipment, 500);
      const expectedTimeline = sanitizeText(body.expectedTimeline || body.timeline, 100);
      const notes = sanitizeText(body.notes || body.message, 2000);
      const sourcePage = sanitizeText(body.sourcePage || req.headers.referer || 'Website Chatbot', 500) || 'Website Chatbot';
      const language = sanitizeText(body.language || 'en', 40);
      const conversationSummary = sanitizeText(body.conversationSummary, 2000);
      const consentGiven = body.consentGiven === true || body.consentGiven === 'true';

      if (!fullName || fullName.length < 2) {
        return res.status(400).json({ ok: false, field: 'fullName', error: 'Please enter your full name (minimum 2 characters).' });
      }

      const phoneDigits = phone.replace(/[^\d]/g, '');
      if (!phone || phoneDigits.length < 8 || phoneDigits.length > 20 || !/^\+?[0-9\s\-()]{8,30}$/.test(phone)) {
        return res.status(400).json({ ok: false, field: 'phone', error: 'Please enter a valid phone number (minimum 8 digits).' });
      }

      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!email || email.length < 5 || !emailRegex.test(email) || /[\r\n]/.test(email)) {
        return res.status(400).json({ ok: false, field: 'email', error: 'Please enter a valid email address.' });
      }

      if (!consentGiven) {
        return res.status(400).json({ ok: false, field: 'consentGiven', error: 'Please confirm your consent before submitting your contact details.' });
      }

      // 4. Duplicate submission prevention
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      const fingerprint = `${email}|${cleanPhone}|${requiredEquipment.toLowerCase()}|${projectLocation.toLowerCase()}`;
      const existingDup = recentLeadFingerprints.get(fingerprint);
      if (existingDup && (Date.now() - existingDup.timestamp < LEAD_DUP_WINDOW_MS)) {
        return res.json({
          ok: true,
          leadId: existingDup.leadId,
          duplicatePrevented: true,
          message: `Your enquiry (${existingDup.leadId}) has already been received. Our team will contact you shortly.`
        });
      }

      // 5. Generate unique ID & build Firestore-compliant payload
      const { doc: docFn, getDoc: getDocFn, setDoc: setDocFn } = firestoreFns || {};
      const leadId = await generateUniqueLeadId(firebaseConfig, db, getDocFn, docFn);
      const createdAt = new Date().toISOString();

      const firestorePayload = {
        id: leadId,
        fullName,
        phone,
        email,
        sourcePage,
        consentGiven: true,
        status: 'new',
        createdAt
      };
      if (company) firestorePayload.company = company;
      if (projectLocation) firestorePayload.projectLocation = projectLocation;
      if (projectType) firestorePayload.projectType = projectType;
      if (requiredEquipment) firestorePayload.requiredEquipment = requiredEquipment;
      if (expectedTimeline) firestorePayload.expectedTimeline = expectedTimeline;
      if (notes) firestorePayload.notes = notes;
      if (language) firestorePayload.language = language;
      if (conversationSummary) firestorePayload.conversationSummary = conversationSummary;

      // 6. Save to Firebase Firestore collection: website_chatbot_leads
      let firestoreSaved = false;
      let firestoreError = null;

      // Method A: Firebase Admin SDK (if service account credentials are available)
      try {
        const admin = require('firebase-admin');
        if (admin.apps && admin.apps.length > 0) {
          const { getFirestore: getAdminFirestore } = require('firebase-admin/firestore');
          const adminDb = getAdminFirestore(admin.apps[0]);
          await adminDb.collection('website_chatbot_leads').doc(leadId).set(firestorePayload);
          firestoreSaved = true;
          console.log(`[Chatbot Firestore Admin]: Saved lead [${leadId}] to website_chatbot_leads`);
        }
      } catch (adminErr) {
        firestoreError = adminErr.message;
      }

      // Method B: Firestore REST API
      if (!firestoreSaved && firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey) {
        try {
          const restUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/website_chatbot_leads?documentId=${encodeURIComponent(leadId)}&key=${firebaseConfig.apiKey}`;
          const fields = {};
          for (const [k, v] of Object.entries(firestorePayload)) {
            if (typeof v === 'boolean') {
              fields[k] = { booleanValue: v };
            } else {
              fields[k] = { stringValue: String(v) };
            }
          }
          const restRes = await fetch(restUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields })
          });
          if (restRes.ok) {
            firestoreSaved = true;
            firestoreError = null;
            console.log(`[Chatbot Firestore REST]: Saved lead [${leadId}] to website_chatbot_leads`);
          } else {
            const errBody = await restRes.text().catch(() => '');
            firestoreError = `HTTP ${restRes.status}: ${errBody}`;
            console.warn(`[Chatbot Firestore REST Notice]: ${firestoreError}`);
          }
        } catch (restErr) {
          firestoreError = restErr.message;
        }
      }

      // Method C: Modular Client SDK fallback
      if (!firestoreSaved && db && docFn && setDocFn) {
        try {
          const docRef = docFn(db, 'website_chatbot_leads', leadId);
          await Promise.race([
            setDocFn(docRef, firestorePayload),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 4000))
          ]);
          firestoreSaved = true;
          firestoreError = null;
          console.log(`[Chatbot Firestore Modular]: Saved lead [${leadId}] to website_chatbot_leads`);
        } catch (modErr) {
          firestoreError = modErr.message;
          console.error('[Chatbot Firestore Modular Error]:', JSON.stringify({
            error: modErr.message,
            operationType: 'create',
            path: `website_chatbot_leads/${leadId}`
          }));
        }
      }

      // Always persist in server secure backup store & record deduplication fingerprint
      saveChatbotLeadLocally({
        ...firestorePayload,
        firestoreSaved,
        ...(firestoreError ? { firestoreNote: firestoreError } : {})
      });
      recentLeadFingerprints.set(fingerprint, { leadId, timestamp: Date.now() });

      // 7. Send email notification to starlineadventure@gmail.com
      let emailSent = false;
      let emailError = null;
      try {
        const emailRes = await sendChatbotLeadNotification(firestorePayload);
        emailSent = Boolean(emailRes && emailRes.sent);
        if (!emailSent && emailRes && emailRes.reason) {
          emailError = emailRes.reason;
        }
      } catch (mailErr) {
        emailError = mailErr && mailErr.message ? mailErr.message : 'Email notification failed';
        console.error(`[Chatbot Email Error]: Lead [${leadId}]:`, emailError);
      }

      return res.json({
        ok: true,
        leadId,
        firestoreSaved,
        emailSent,
        message: 'Thank you! Your project enquiry has been submitted successfully. Our engineering & sales team will contact you shortly.',
        ...(emailError ? { emailNotice: emailError } : {})
      });
    } catch (err) {
      console.error('[Chatbot Lead Endpoint Error]:', err && err.message ? err.message : err);
      return res.status(500).json({
        ok: false,
        error: 'Unable to submit your enquiry right now. Please try again or reach us at +91 94249 04000.'
      });
    }
  });

  // ------------------------------------------------------------
  // GET /api/chatbot/leads (Admin protected)
  // ------------------------------------------------------------
  if (typeof requireAdminAuth === 'function') {
    router.get('/leads', requireAdminAuth, (req, res) => {
      const leads = getStoredChatbotLeads();
      return res.json({ ok: true, count: leads.length, leads });
    });
  }

  return router;
}

module.exports = { createChatbotRouter };
