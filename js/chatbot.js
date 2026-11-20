/**
 * Starline Adventures — Rebuilt AI Chatbot & Enquiry Assistant (v3)
 * - Server-side Gemini AI integration via centralized STARLINE_CONFIG
 * - Session-scoped multi-turn conversation memory
 * - Multilingual auto-matching (English, Hindi, Hinglish, Marathi)
 * - Dynamic WhatsApp context generation + In-panel Enquiry Form
 * - Honest error handling, retry support, duplicate-submit prevention
 */
(function initStarlineChatbot() {
    'use strict';

    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (window.__starlineChatbotV3Initialized) return;
    window.__starlineChatbotV3Initialized = true;

    const STORAGE_MESSAGES_KEY = 'starline_ai_chat_messages_v3';
    const STORAGE_SESSION_KEY = 'starline_ai_chat_session_v3';
    const MAX_STORED_MESSAGES = 40;
    const MAX_HISTORY_TO_SEND = 12;

    const WELCOME_MESSAGE = {
        id: 'welcome',
        role: 'assistant',
        text: "Hello! Welcome to **Starline Adventures**. I'm your Adventure AI & Sales Assistant.\n\nAsk me anything about ziplines, giant swings, rope courses, climbing walls, project planning by land size, safety concepts, or our completed installations across India — in English, Hindi, Hinglish, or Marathi!"
    };

    const QUICK_SUGGESTIONS = [
        { label: '🏗️ Build Adventure Park', query: 'I want to build an adventure park. Where do we start?' },
        { label: '📐 2 Acres Land Plan', query: 'I have 2 acres of land. What activities can I install?' },
        { label: '🎢 Zipline Explained', query: 'What is a zipline and what does Starline offer?' },
        { label: '💧 Water Park Advice', query: 'I want to plan a water park. What should I consider?' },
        { label: '🏆 Completed Projects', query: 'What projects has Starline Adventures completed?' }
    ];

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatMessageHtml(rawText) {
        const escaped = escapeHtml(rawText || '');
        const lines = escaped.split(/\r?\n/);
        const htmlParts = [];
        let inList = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            const headingMatch = trimmed.match(/^#{1,4}\s+(.+)$/);
            const hrMatch = /^(\*{3,}|-{3,})$/.test(trimmed);
            const bulletMatch = trimmed.match(/^(?:[-*•]|(\d+)\.)\s+(.+)$/);

            if (headingMatch) {
                if (inList) {
                    htmlParts.push('</ul>');
                    inList = false;
                }
                htmlParts.push(`<div class="starline-chat-heading">${formatInlineMarkdown(headingMatch[1])}</div>`);
            } else if (hrMatch) {
                if (inList) {
                    htmlParts.push('</ul>');
                    inList = false;
                }
                htmlParts.push('<hr class="starline-chat-divider">');
            } else if (bulletMatch) {
                if (!inList) {
                    htmlParts.push('<ul class="starline-chat-list">');
                    inList = true;
                }
                htmlParts.push(`<li>${formatInlineMarkdown(bulletMatch[2])}</li>`);
            } else {
                if (inList) {
                    htmlParts.push('</ul>');
                    inList = false;
                }
                if (trimmed === '') {
                    if (htmlParts.length > 0 && htmlParts[htmlParts.length - 1] !== '<div class="starline-chat-gap"></div>') {
                        htmlParts.push('<div class="starline-chat-gap"></div>');
                    }
                } else {
                    htmlParts.push(`<p class="starline-chat-p">${formatInlineMarkdown(trimmed)}</p>`);
                }
            }
        }

        if (inList) {
            htmlParts.push('</ul>');
        }

        return htmlParts.join('');
    }

    function formatInlineMarkdown(text) {
        const placeholders = [];
        let result = String(text || '').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => {
            const idx = placeholders.length;
            placeholders.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="starline-chat-inline-link">${label}</a>`);
            return `__STARLINE_LINK_${idx}__`;
        });
        result = result
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/(\+91[-\s]?\d{4,5}[-\s]?\d{5,6})/g, '<a href="tel:$1" class="starline-chat-inline-link">$1</a>');
        placeholders.forEach((html, idx) => {
            result = result.replace(`__STARLINE_LINK_${idx}__`, html);
        });
        return result;
    }

    function generateSessionId() {
        const rand = Math.random().toString(36).slice(2, 10);
        return `sess_${Date.now().toString(36)}_${rand}`;
    }

    function getOrCreateSessionId() {
        try {
            const existing = localStorage.getItem(STORAGE_SESSION_KEY);
            if (existing && /^[a-zA-Z0-9_-]{6,128}$/.test(existing)) {
                return existing;
            }
            const fresh = generateSessionId();
            localStorage.setItem(STORAGE_SESSION_KEY, fresh);
            return fresh;
        } catch (e) {
            return generateSessionId();
        }
    }

    function loadMessages() {
        try {
            const raw = localStorage.getItem(STORAGE_MESSAGES_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const valid = parsed.filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string' && !m.isTyping);
                    if (valid.length > 0) return valid.slice(-MAX_STORED_MESSAGES);
                }
            }
        } catch (e) {}
        return [{ ...WELCOME_MESSAGE }];
    }

    function saveMessages(msgs) {
        try {
            const clean = (msgs || [])
                .filter(m => m && !m.isTyping)
                .slice(-MAX_STORED_MESSAGES);
            localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(clean));
        } catch (e) {}
    }

    function extractProjectContext(msgs) {
        const userText = (msgs || [])
            .filter(m => m && m.role === 'user' && m.text)
            .map(m => m.text)
            .join(' \n ');
        const lower = userText.toLowerCase();

        let projectType = '';
        if (lower.includes('water park') || lower.includes('waterpark')) projectType = 'Water Park';
        else if (lower.includes('resort') || lower.includes('hotel')) projectType = 'Resort / Hotel';
        else if (lower.includes('indoor')) projectType = 'Indoor Entertainment Zone';
        else if (lower.includes('school') || lower.includes('college') || lower.includes('campus')) projectType = 'School / College Campus';
        else if (lower.includes('eco-tourism') || lower.includes('forest') || lower.includes('farm')) projectType = 'Eco / Agro-Tourism Project';
        else if (lower.includes('adventure park') || lower.includes('theme park') || lower.includes('amusement')) projectType = 'Adventure Park';

        let land = '';
        const landMatch = userText.match(/\b(\d+(?:\.\d+)?\s*(?:acres?|acre|hectares?|ha|sq\.?\s*ft|sqft|square\s*feet|bigha|guntha))\b/i);
        if (landMatch) land = landMatch[1].trim();

        let location = '';
        const locMatch = userText.match(/\b(?:in|at|near|location[:\s]+)\s*([A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{2,})?)\b/);
        if (locMatch && !['Adventure', 'Water', 'Park', 'India', 'Starline', 'Giant', 'Rope'].includes(locMatch[1])) {
            location = locMatch[1].trim();
        }

        const activityKeywords = [
            ['zipline', 'Zip Line'],
            ['zip line', 'Zip Line'],
            ['giant swing', 'Giant Swing'],
            ['rope course', 'Rope Course'],
            ['ninja', 'Ninja Rope Course'],
            ['climbing wall', 'Wall Climbing'],
            ['wall climbing', 'Wall Climbing'],
            ['sky cycling', 'Sky Cycling'],
            ['sky cycle', 'Sky Cycling'],
            ['sky roller', 'Sky Roller'],
            ['bungee', 'Bungee Jumping'],
            ['trampoline', 'Trampoline'],
            ['glass bridge', 'Glass Bridge'],
            ['suspension bridge', 'Suspension Bridge'],
            ['gyro', 'Human Gyro'],
            ['360', '360 Degree Cycle'],
            ['bull ride', 'Mechanical Bull Ride'],
            ['archery', 'Archery'],
            ['rifle', 'Rifle Shooting'],
            ['tower', 'Multi Activity Tower']
        ];
        const activities = [];
        for (const [kw, label] of activityKeywords) {
            if (lower.includes(kw) && !activities.includes(label)) {
                activities.push(label);
            }
        }

        return {
            projectType,
            land,
            location,
            activities: activities.join(', ')
        };
    }

    function buildDynamicWhatsAppUrl(ctx) {
        const parts = ['Hello Starline Adventures'];
        if (ctx.projectType) {
            parts.push(`I am interested in developing a ${ctx.projectType}`);
        } else {
            parts.push('I am interested in adventure rides & park equipment');
        }
        if (ctx.location) parts.push(`Location: ${ctx.location}`);
        if (ctx.land) parts.push(`Available land: ${ctx.land}`);
        if (ctx.activities) parts.push(`Activities: ${ctx.activities}`);
        parts.push('Please contact me.');

        const msg = parts.join('. ').replace(/\.\s*\./g, '.');
        return `https://wa.me/919424904000?text=${encodeURIComponent(msg)}`;
    }

    function resolveChatEndpoint() {
        if (typeof window.STARLINE_CONFIG !== 'undefined' && typeof window.STARLINE_CONFIG.getChatEndpointInfo === 'function') {
            return window.STARLINE_CONFIG.getChatEndpointInfo();
        }
        const host = (window.location.hostname || '').toLowerCase();
        if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.run.app') || host.endsWith('.googleusercontent.com') || host.endsWith('.onrender.com')) {
            return { configured: true, url: '/api/chat', enquiryUrl: '/api/enquiry', errorMessage: null };
        }
        return {
            configured: false,
            url: null,
            enquiryUrl: null,
            errorMessage: 'Backend API URL is not configured in js/config.js (PRODUCTION_BACKEND_URL).'
        };
    }

    function mountChatbotWidget() {
        if (!document.body) return;
        if (document.getElementById('starline-chatbot-widget')) return;

        // Clean up any legacy leftover container if present
        const legacy = document.getElementById('starline-chatbot-widget');
        if (legacy) legacy.remove();

        const widget = document.createElement('div');
        widget.id = 'starline-chatbot-widget';
        widget.className = 'starline-chatbot-widget';

        widget.innerHTML = `
            <div class="starline-chatbot-panel"
                 id="starline-chatbot-panel"
                 role="dialog"
                 aria-modal="false"
                 aria-labelledby="starline-chatbot-title"
                 aria-hidden="true">

                <div class="starline-chatbot-header">
                    <div class="starline-chatbot-brand">
                        <span class="starline-chatbot-status-dot" aria-hidden="true"></span>
                        <div class="starline-chatbot-title-wrap">
                            <span class="starline-chatbot-title" id="starline-chatbot-title">STARLINE ADVENTURES</span>
                            <span class="starline-chatbot-subtitle">Adventure AI &amp; Sales Assistant</span>
                        </div>
                    </div>
                    <div class="starline-chatbot-header-actions">
                        <button type="button"
                                class="starline-chatbot-header-btn starline-chatbot-reset"
                                id="starline-chatbot-reset"
                                aria-label="New Chat / Clear conversation"
                                title="New Chat">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                <path d="M3 3v5h5"></path>
                            </svg>
                        </button>
                        <button type="button"
                                class="starline-chatbot-header-btn starline-chatbot-minimize"
                                id="starline-chatbot-minimize"
                                aria-label="Minimize chat assistant"
                                title="Minimize">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <button type="button"
                                class="starline-chatbot-header-btn starline-chatbot-close"
                                id="starline-chatbot-close"
                                aria-label="Close chat assistant"
                                title="Close">&times;</button>
                    </div>
                </div>

                <!-- Clear Conversation Confirmation Banner -->
                <div class="starline-chatbot-confirm-bar" id="starline-chatbot-confirm-bar" hidden>
                    <span>Start a new chat and clear current messages?</span>
                    <div class="starline-chatbot-confirm-actions">
                        <button type="button" class="starline-confirm-btn starline-confirm-btn--yes" id="starline-confirm-reset-yes">Clear Chat</button>
                        <button type="button" class="starline-confirm-btn starline-confirm-btn--no" id="starline-confirm-reset-no">Cancel</button>
                    </div>
                </div>

                <!-- Main Chat View -->
                <div class="starline-chatbot-view" id="starline-chatbot-chat-view">
                    <div class="starline-chatbot-chips" id="starline-chatbot-chips" aria-label="Quick suggestions">
                        ${QUICK_SUGGESTIONS.map(s => `
                            <button type="button" class="starline-chatbot-chip" data-query="${escapeHtml(s.query)}">${escapeHtml(s.label)}</button>
                        `).join('')}
                    </div>

                    <div class="starline-chatbot-body">
                        <div class="starline-native-chat">
                            <div class="starline-chat-messages" id="starline-chat-messages" aria-live="polite"></div>
                            <div class="starline-chat-input-area">
                                <form id="starline-chat-form" class="starline-chat-form" novalidate>
                                    <textarea id="starline-chat-input"
                                              class="starline-chat-input"
                                              rows="1"
                                              maxlength="2000"
                                              placeholder="Ask about rides, planning, safety, or projects..."
                                              aria-label="Type your message"
                                              required></textarea>
                                    <button type="submit" class="starline-chat-send" id="starline-chat-send" aria-label="Send message" title="Send (Enter)">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                            <line x1="22" y1="2" x2="11" y2="13"></line>
                                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                        </svg>
                                    </button>
                                </form>
                                <div class="starline-chat-input-hint">Enter to send &bull; Shift+Enter for new line</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Integrated Enquiry Form View -->
                <div class="starline-chatbot-enquiry-view" id="starline-chatbot-enquiry-view" hidden>
                    <div class="starline-enquiry-topbar">
                        <button type="button" class="starline-enquiry-back" id="starline-enquiry-back">&larr; Back to AI Chat</button>
                        <span class="starline-enquiry-heading">Project Quote &amp; Enquiry</span>
                    </div>

                    <form id="starline-chatbot-enquiry-form" class="starline-enquiry-form" novalidate>
                        <input type="text" name="website_hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;opacity:0;height:0;width:0;" aria-hidden="true">

                        <div class="starline-enq-grid">
                            <div class="starline-enq-field">
                                <label for="cbEnqName">Full Name <span>*</span></label>
                                <input type="text" id="cbEnqName" name="name" placeholder="Your full name" required maxlength="100">
                                <span class="starline-enq-err" id="cbErrName"></span>
                            </div>

                            <div class="starline-enq-field">
                                <label for="cbEnqPhone">Phone Number <span>*</span></label>
                                <input type="tel" id="cbEnqPhone" name="phone" placeholder="+91-94249-04000" required maxlength="30">
                                <span class="starline-enq-err" id="cbErrPhone"></span>
                            </div>

                            <div class="starline-enq-field starline-enq-full">
                                <label for="cbEnqEmail">Email Address <span>*</span></label>
                                <input type="email" id="cbEnqEmail" name="email" placeholder="you@company.com" required maxlength="120">
                                <span class="starline-enq-err" id="cbErrEmail"></span>
                            </div>

                            <div class="starline-enq-field">
                                <label for="cbEnqLocation">Project Location</label>
                                <input type="text" id="cbEnqLocation" name="location" placeholder="City / State" maxlength="120">
                            </div>

                            <div class="starline-enq-field">
                                <label for="cbEnqLand">Available Land</label>
                                <input type="text" id="cbEnqLand" name="availableLand" placeholder="e.g. 2 acres / 10,000 sq ft" maxlength="80">
                            </div>

                            <div class="starline-enq-field starline-enq-full">
                                <label for="cbEnqType">Project Type</label>
                                <select id="cbEnqType" name="projectType">
                                    <option value="">Select project type (optional)</option>
                                    <option value="Adventure Park">Adventure Park</option>
                                    <option value="Resort / Hotel">Resort / Hotel</option>
                                    <option value="Water Park">Water Park</option>
                                    <option value="Indoor Entertainment Park">Indoor Entertainment Park</option>
                                    <option value="Eco / Agro-Tourism Project">Eco / Agro-Tourism Project</option>
                                    <option value="School / College Campus">School / College Campus</option>
                                    <option value="Government / Tourism Project">Government / Tourism Project</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div class="starline-enq-field starline-enq-full">
                                <label for="cbEnqActivities">Activities Interested In</label>
                                <input type="text" id="cbEnqActivities" name="activities" placeholder="e.g. Zipline, Rope Course, Giant Swing" maxlength="120">
                            </div>

                            <div class="starline-enq-field starline-enq-full">
                                <label for="cbEnqMessage">Project Requirements / Message <span>*</span></label>
                                <textarea id="cbEnqMessage" name="message" rows="3" placeholder="Tell us about your project goals, timeline, or questions..." required maxlength="2000"></textarea>
                                <span class="starline-enq-err" id="cbErrMessage"></span>
                            </div>
                        </div>

                        <div class="starline-enq-status" id="cbEnqStatus" role="alert" aria-live="polite" hidden></div>

                        <button type="submit" class="starline-enq-submit" id="cbEnqSubmitBtn">
                            Submit Project Enquiry &rarr;
                        </button>
                    </form>

                    <div class="starline-enq-success" id="cbEnqSuccess" hidden>
                        <div class="starline-enq-success-icon">&#10003;</div>
                        <h4>Enquiry Submitted Successfully</h4>
                        <p class="starline-enq-ref" id="cbEnqRefBadge"></p>
                        <p class="starline-enq-success-text" id="cbEnqSuccessMsg"></p>
                        <div class="starline-enq-success-actions">
                            <a href="https://wa.me/919424904000" target="_blank" rel="noopener noreferrer" class="starline-chatbot-sales-btn starline-chatbot-sales-btn--wa" id="cbEnqSuccessWa">💬 Follow Up on WhatsApp</a>
                            <button type="button" class="starline-confirm-btn starline-confirm-btn--no" id="cbEnqNewBtn">Back to Chat</button>
                        </div>
                    </div>
                </div>

                <!-- Persistent Sales Bar -->
                <div class="starline-chatbot-sales-bar">
                    <a href="https://wa.me/919424904000?text=Hello%20Starline%20Adventures%2C%20I%20am%20interested%20in%20adventure%20rides%20and%20equipment.%20Please%20contact%20me."
                       target="_blank"
                       rel="noopener noreferrer"
                       class="starline-chatbot-sales-btn starline-chatbot-sales-btn--wa"
                       id="starline-chatbot-wa-btn"
                       aria-label="Chat with Starline Sales Team on WhatsApp"
                       title="WhatsApp Sales Team">
                        💬 WhatsApp Sales
                    </a>
                    <a href="tel:+919424904000"
                       class="starline-chatbot-sales-btn starline-chatbot-sales-btn--call"
                       aria-label="Call Starline Sales Team"
                       title="Call +91 94249 04000">
                        📞 Call Sales
                    </a>
                    <button type="button"
                            class="starline-chatbot-sales-btn starline-chatbot-sales-btn--quote"
                            id="starline-chatbot-quote-trigger"
                            aria-label="Request custom project quotation"
                            title="Request Quote">
                        📋 Request Quote
                    </button>
                </div>
            </div>

            <button type="button"
                    class="starline-chatbot-launcher"
                    id="starline-chatbot-launcher"
                    aria-label="Open chat assistant"
                    aria-expanded="false"
                    aria-controls="starline-chatbot-panel"
                    title="Chat with Starline Adventures AI">
                <span class="starline-chatbot-launcher-icon starline-chatbot-launcher-icon--chat" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                </span>
                <span class="starline-chatbot-launcher-icon starline-chatbot-launcher-icon--close" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </span>
            </button>
        `;

        document.body.appendChild(widget);

        // DOM References
        const panel = widget.querySelector('#starline-chatbot-panel');
        const launcher = widget.querySelector('#starline-chatbot-launcher');
        const closeBtn = widget.querySelector('#starline-chatbot-close');
        const minimizeBtn = widget.querySelector('#starline-chatbot-minimize');
        const resetBtn = widget.querySelector('#starline-chatbot-reset');
        const confirmBar = widget.querySelector('#starline-chatbot-confirm-bar');
        const confirmYesBtn = widget.querySelector('#starline-confirm-reset-yes');
        const confirmNoBtn = widget.querySelector('#starline-confirm-reset-no');

        const chatView = widget.querySelector('#starline-chatbot-chat-view');
        const enquiryView = widget.querySelector('#starline-chatbot-enquiry-view');
        const messagesContainer = widget.querySelector('#starline-chat-messages');
        const chatForm = widget.querySelector('#starline-chat-form');
        const chatInput = widget.querySelector('#starline-chat-input');
        const sendBtn = widget.querySelector('#starline-chat-send');
        const waBtn = widget.querySelector('#starline-chatbot-wa-btn');
        const quoteTriggerBtn = widget.querySelector('#starline-chatbot-quote-trigger');

        const enquiryBackBtn = widget.querySelector('#starline-enquiry-back');
        const enquiryForm = widget.querySelector('#starline-chatbot-enquiry-form');
        const enquiryStatus = widget.querySelector('#cbEnqStatus');
        const enquirySubmitBtn = widget.querySelector('#cbEnqSubmitBtn');
        const enquirySuccess = widget.querySelector('#cbEnqSuccess');
        const enquiryRefBadge = widget.querySelector('#cbEnqRefBadge');
        const enquirySuccessMsg = widget.querySelector('#cbEnqSuccessMsg');
        const enquirySuccessWa = widget.querySelector('#cbEnqSuccessWa');
        const enquiryNewBtn = widget.querySelector('#cbEnqNewBtn');

        if (panel && 'inert' in panel) {
            panel.inert = true;
        }

        // State
        let sessionId = getOrCreateSessionId();
        let messages = loadMessages();
        let isSending = false;
        let lastSubmittedText = '';
        let lastSubmittedAt = 0;

        function autoResizeTextarea() {
            if (!chatInput) return;
            chatInput.style.height = 'auto';
            chatInput.style.height = Math.min(chatInput.scrollHeight, 96) + 'px';
        }

        function setSendingState(sending) {
            isSending = sending;
            if (sendBtn) {
                sendBtn.disabled = sending;
                sendBtn.classList.toggle('is-loading', sending);
            }
            if (chatInput) {
                chatInput.disabled = sending;
            }
            widget.querySelectorAll('.starline-chatbot-chip').forEach(chip => {
                chip.disabled = sending;
            });
        }

        function syncDynamicWhatsApp() {
            if (!waBtn) return;
            const ctx = extractProjectContext(messages);
            waBtn.href = buildDynamicWhatsAppUrl(ctx);
        }

        function renderMessages() {
            if (!messagesContainer) return;

            messagesContainer.innerHTML = messages.map((m, idx) => {
                if (m.isTyping) {
                    return `
                        <div class="starline-chat-msg assistant is-typing" aria-label="Starline AI is typing">
                            <div class="starline-typing-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    `;
                }

                if (m.isError) {
                    const retryBtnHtml = m.retryText
                        ? `<button type="button" class="starline-chat-retry-btn" data-retry-idx="${idx}">🔄 Retry</button>`
                        : '';
                    return `
                        <div class="starline-chat-msg assistant is-error" role="alert">
                            <div class="starline-chat-error-text">${escapeHtml(m.text)}</div>
                            ${retryBtnHtml}
                        </div>
                    `;
                }

                return `
                    <div class="starline-chat-msg ${m.role === 'user' ? 'user' : 'assistant'}">
                        ${m.role === 'user' ? escapeHtml(m.text) : formatMessageHtml(m.text)}
                    </div>
                `;
            }).join('');

            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            syncDynamicWhatsApp();
        }

        renderMessages();

        async function sendToGemini(textToSend, options = {}) {
            const cleanText = String(textToSend || '').trim();
            if (!cleanText || isSending) return;

            // Duplicate-submission protection within 1.5s for identical prompt
            const now = Date.now();
            if (!options.isRetry && cleanText === lastSubmittedText && (now - lastSubmittedAt) < 1500) {
                return;
            }
            lastSubmittedText = cleanText;
            lastSubmittedAt = now;

            // Clear any previous transient error cards before retrying
            messages = messages.filter(m => !m.isError && !m.isTyping);

            if (!options.isRetry) {
                messages.push({
                    id: 'u_' + now,
                    role: 'user',
                    text: cleanText
                });
                if (chatInput) {
                    chatInput.value = '';
                    autoResizeTextarea();
                }
            }

            // Build history BEFORE appending typing indicator (and excluding current user turn since backend appends message)
            const historyForApi = messages
                .slice(0, -1)
                .filter(m => !m.isTyping && !m.isError && m.id !== 'welcome')
                .slice(-MAX_HISTORY_TO_SEND)
                .map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    text: m.text
                }));

            const typingId = 'typing_' + Date.now();
            messages.push({ id: typingId, role: 'assistant', text: '', isTyping: true });
            setSendingState(true);
            renderMessages();

            const endpointInfo = resolveChatEndpoint();
            if (!endpointInfo.configured || !endpointInfo.url) {
                messages = messages.filter(m => m.id !== typingId);
                messages.push({
                    id: 'err_' + Date.now(),
                    role: 'assistant',
                    isError: true,
                    retryText: cleanText,
                    text: endpointInfo.errorMessage || 'Backend API URL is not configured.'
                });
                setSendingState(false);
                saveMessages(messages);
                renderMessages();
                return;
            }

            const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const timeoutId = controller ? setTimeout(() => controller.abort(), 65000) : null;

            try {
                const res = await fetch(endpointInfo.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        message: cleanText,
                        sessionId: sessionId,
                        history: historyForApi
                    }),
                    ...(controller ? { signal: controller.signal } : {})
                });

                if (timeoutId) clearTimeout(timeoutId);
                messages = messages.filter(m => m.id !== typingId);

                let data = null;
                try {
                    data = await res.json();
                } catch (parseErr) {
                    data = null;
                }

                if (res.ok && data && data.ok && data.reply) {
                    messages.push({
                        id: 'a_' + Date.now(),
                        role: 'assistant',
                        text: data.reply
                    });
                } else {
                    const errMsg = (data && data.error)
                        ? data.error
                        : (res.status === 405
                            ? 'Backend endpoint rejected POST (HTTP 405). Check PRODUCTION_BACKEND_URL in js/config.js.'
                            : `Unable to get a response from Starline AI (HTTP ${res.status}). Please retry.`);

                    console.error('[Starline Chatbot API Error]:', res.status, data || res.statusText);
                    messages.push({
                        id: 'err_' + Date.now(),
                        role: 'assistant',
                        isError: true,
                        retryText: cleanText,
                        text: errMsg
                    });
                }
            } catch (err) {
                if (timeoutId) clearTimeout(timeoutId);
                messages = messages.filter(m => m.id !== typingId);
                const isAbort = err && err.name === 'AbortError';
                console.error('[Starline Chatbot Network Error]:', err && err.message ? err.message : err);

                messages.push({
                    id: 'err_' + Date.now(),
                    role: 'assistant',
                    isError: true,
                    retryText: cleanText,
                    text: isAbort
                        ? 'The request timed out while waiting for Starline AI. Please retry.'
                        : 'Could not reach the Starline AI server. Please check your internet connection or backend configuration and retry.'
                });
            } finally {
                setSendingState(false);
                saveMessages(messages);
                renderMessages();
                if (chatInput && !chatInput.disabled && widget.classList.contains('is-open') && enquiryView && enquiryView.hidden) {
                    chatInput.focus();
                }
            }
        }

        // Delegate retry button clicks inside message list
        messagesContainer?.addEventListener('click', (e) => {
            const retryBtn = e.target.closest('.starline-chat-retry-btn');
            if (!retryBtn || isSending) return;
            const idx = Number(retryBtn.getAttribute('data-retry-idx'));
            const item = Number.isInteger(idx) ? messages[idx] : null;
            if (item && item.retryText) {
                sendToGemini(item.retryText, { isRetry: true });
            }
        });

        // Submit handler + Enter / Shift+Enter
        chatForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (chatInput && !isSending) {
                sendToGemini(chatInput.value);
            }
        });

        chatInput?.addEventListener('input', autoResizeTextarea);
        chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
                e.preventDefault();
                if (!isSending) {
                    sendToGemini(chatInput.value);
                }
            }
        });

        // Quick suggestion chips
        widget.querySelectorAll('.starline-chatbot-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isSending) return;
                const query = chip.getAttribute('data-query') || '';
                if (query) {
                    showChatView();
                    sendToGemini(query);
                }
            });
        });

        // Panel open / minimize / close
        function setOpenState(open) {
            const isOpen = Boolean(open);
            widget.classList.toggle('is-open', isOpen);
            document.body.classList.toggle('starline-chatbot-open', isOpen);
            if (panel) {
                panel.setAttribute('aria-hidden', String(!isOpen));
                if ('inert' in panel) {
                    panel.inert = !isOpen;
                }
            }
            if (launcher) {
                launcher.setAttribute('aria-expanded', String(isOpen));
                launcher.setAttribute('aria-label', isOpen ? 'Close chat assistant' : 'Open chat assistant');
                launcher.setAttribute('title', isOpen ? 'Close chat' : 'Chat with Starline Adventures AI');
            }
            if (!isOpen && confirmBar) {
                confirmBar.hidden = true;
            }
            if (isOpen && chatInput && enquiryView.hidden) {
                setTimeout(() => chatInput.focus(), 180);
            }
        }

        function openChatbot() {
            setOpenState(true);
        }

        function closeChatbot(restoreFocus) {
            setOpenState(false);
            if (restoreFocus && launcher) {
                launcher.focus();
            }
        }

        function toggleChatbot() {
            setOpenState(!widget.classList.contains('is-open'));
        }

        function performResetChat() {
            sessionId = generateSessionId();
            try {
                localStorage.setItem(STORAGE_SESSION_KEY, sessionId);
                localStorage.removeItem(STORAGE_MESSAGES_KEY);
            } catch (e) {}
            messages = [{ ...WELCOME_MESSAGE }];
            lastSubmittedText = '';
            lastSubmittedAt = 0;
            if (confirmBar) confirmBar.hidden = true;
            showChatView();
            renderMessages();
            if (chatInput) chatInput.focus();
        }

        launcher?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleChatbot();
        });

        minimizeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            closeChatbot(true);
        });

        closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            closeChatbot(true);
        });

        resetBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            // If only welcome message exists, no confirmation needed
            if (messages.length <= 1) {
                performResetChat();
                return;
            }
            if (confirmBar) {
                confirmBar.hidden = !confirmBar.hidden;
            }
        });

        confirmYesBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            performResetChat();
        });

        confirmNoBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirmBar) confirmBar.hidden = true;
        });

        // View switching: Chat <-> Enquiry Form
        function showChatView() {
            if (chatView) chatView.hidden = false;
            if (enquiryView) enquiryView.hidden = true;
        }

        function showEnquiryView() {
            if (confirmBar) confirmBar.hidden = true;
            if (chatView) chatView.hidden = true;
            if (enquiryView) enquiryView.hidden = false;
            if (enquiryForm) enquiryForm.hidden = false;
            if (enquirySuccess) enquirySuccess.hidden = true;
            if (enquiryStatus) {
                enquiryStatus.hidden = true;
                enquiryStatus.textContent = '';
            }

            // Pre-fill extracted project context from conversation
            const ctx = extractProjectContext(messages);
            const locInput = widget.querySelector('#cbEnqLocation');
            const landInput = widget.querySelector('#cbEnqLand');
            const typeSelect = widget.querySelector('#cbEnqType');
            const actInput = widget.querySelector('#cbEnqActivities');
            const nameInput = widget.querySelector('#cbEnqName');

            if (locInput && !locInput.value && ctx.location) locInput.value = ctx.location;
            if (landInput && !landInput.value && ctx.land) landInput.value = ctx.land;
            if (typeSelect && !typeSelect.value && ctx.projectType) typeSelect.value = ctx.projectType;
            if (actInput && !actInput.value && ctx.activities) actInput.value = ctx.activities;

            setTimeout(() => {
                if (nameInput) nameInput.focus();
            }, 80);
        }

        quoteTriggerBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            showEnquiryView();
        });

        enquiryBackBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            showChatView();
        });

        enquiryNewBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            showChatView();
        });

        // Integrated Enquiry Form Submission
        let isSubmittingEnquiry = false;

        enquiryForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isSubmittingEnquiry) return;

            const hp = enquiryForm.querySelector('[name="website_hp"]');
            if (hp && hp.value) return;

            const nameEl = widget.querySelector('#cbEnqName');
            const phoneEl = widget.querySelector('#cbEnqPhone');
            const emailEl = widget.querySelector('#cbEnqEmail');
            const locEl = widget.querySelector('#cbEnqLocation');
            const landEl = widget.querySelector('#cbEnqLand');
            const typeEl = widget.querySelector('#cbEnqType');
            const actEl = widget.querySelector('#cbEnqActivities');
            const msgEl = widget.querySelector('#cbEnqMessage');

            const errName = widget.querySelector('#cbErrName');
            const errPhone = widget.querySelector('#cbErrPhone');
            const errEmail = widget.querySelector('#cbErrEmail');
            const errMsg = widget.querySelector('#cbErrMessage');

            [errName, errPhone, errEmail, errMsg].forEach(el => { if (el) el.textContent = ''; });
            [nameEl, phoneEl, emailEl, msgEl].forEach(el => { if (el) el.classList.remove('has-error'); });
            if (enquiryStatus) {
                enquiryStatus.hidden = true;
                enquiryStatus.textContent = '';
                enquiryStatus.className = 'starline-enq-status';
            }

            const name = nameEl ? nameEl.value.trim() : '';
            const phone = phoneEl ? phoneEl.value.trim() : '';
            const email = emailEl ? emailEl.value.trim().toLowerCase() : '';
            const location = locEl ? locEl.value.trim() : '';
            const availableLand = landEl ? landEl.value.trim() : '';
            const projectType = typeEl ? typeEl.value.trim() : '';
            const activities = actEl ? actEl.value.trim() : '';
            const message = msgEl ? msgEl.value.trim() : '';

            let valid = true;
            if (!name || name.length < 2) {
                valid = false;
                if (nameEl) nameEl.classList.add('has-error');
                if (errName) errName.textContent = 'Please enter your full name (min 2 characters).';
            }

            const phoneDigits = phone.replace(/[^\d]/g, '');
            if (!phone || phoneDigits.length < 8 || phoneDigits.length > 15 || !/^\+?[0-9\s\-()]{8,30}$/.test(phone)) {
                valid = false;
                if (phoneEl) phoneEl.classList.add('has-error');
                if (errPhone) errPhone.textContent = 'Please enter a valid phone number (8 to 15 digits).';
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                valid = false;
                if (emailEl) emailEl.classList.add('has-error');
                if (errEmail) errEmail.textContent = 'Please enter a valid email address.';
            }

            if (!message || message.length < 2) {
                valid = false;
                if (msgEl) msgEl.classList.add('has-error');
                if (errMsg) errMsg.textContent = 'Please describe your project requirements.';
            }

            if (!valid) return;

            isSubmittingEnquiry = true;
            if (enquirySubmitBtn) {
                enquirySubmitBtn.disabled = true;
                enquirySubmitBtn.textContent = 'Submitting...';
            }

            const payload = {
                name,
                phone,
                email,
                location: location || 'Not specified',
                projectType,
                activities,
                availableLand,
                product: activities || projectType || 'Chatbot Project Enquiry',
                message,
                formType: 'Chatbot Project Enquiry',
                pageUrl: window.location.href,
                referrer: document.referrer || 'Direct'
            };

            let submitResult = null;
            let lastErrorMsg = '';

            // 1. Try backend /api/enquiry
            const endpointInfo = resolveChatEndpoint();
            if (endpointInfo.configured && endpointInfo.enquiryUrl) {
                try {
                    const res = await fetch(endpointInfo.enquiryUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json().catch(() => null);
                    if (res.ok && data && data.ok) {
                        submitResult = data;
                    } else {
                        lastErrorMsg = (data && data.error) || `Server returned HTTP ${res.status}`;
                    }
                } catch (err) {
                    lastErrorMsg = err && err.message ? err.message : 'Unable to reach enquiry server.';
                }
            }

            // 2. If backend unavailable (e.g. static hosting before Render deploy), try direct Firebase Firestore SDK
            if (!submitResult && typeof window.StarlineFirebase !== 'undefined' && typeof window.StarlineFirebase.saveEnquiry === 'function') {
                try {
                    const extraLines = [];
                    if (projectType) extraLines.push(`Project Type: ${projectType}`);
                    if (activities) extraLines.push(`Activities Interested In: ${activities}`);
                    if (availableLand) extraLines.push(`Available Land: ${availableLand}`);
                    const fbPayload = Object.assign({}, payload, {
                        message: extraLines.length ? `${extraLines.join(' | ')}\n\n${message}` : message
                    });
                    const fbRes = await window.StarlineFirebase.saveEnquiry(fbPayload);
                    if (fbRes && fbRes.ok) {
                        submitResult = fbRes;
                    }
                } catch (fbErr) {
                    lastErrorMsg = lastErrorMsg || (fbErr && fbErr.message) || 'Firestore submission failed.';
                }
            }

            isSubmittingEnquiry = false;
            if (enquirySubmitBtn) {
                enquirySubmitBtn.disabled = false;
                enquirySubmitBtn.textContent = 'Submit Project Enquiry →';
            }

            if (submitResult && submitResult.ok) {
                const refId = submitResult.enquiryId || submitResult.id || 'Submitted';
                if (enquiryForm) enquiryForm.hidden = true;
                if (enquirySuccess) enquirySuccess.hidden = false;
                if (enquiryRefBadge) enquiryRefBadge.textContent = `Reference ID: ${refId}`;
                if (enquirySuccessMsg) {
                    enquirySuccessMsg.textContent = submitResult.customerMessage || submitResult.message || 'Thank you! Your enquiry has been recorded. Our engineering and sales team will reach out shortly.';
                }
                if (enquirySuccessWa) {
                    const waParts = [
                        `Hello Starline Adventures, I submitted an enquiry [${refId}]`,
                        `Name: ${name}`,
                        `Phone: ${phone}`,
                        location ? `Location: ${location}` : '',
                        projectType ? `Project: ${projectType}` : '',
                        availableLand ? `Land: ${availableLand}` : '',
                        activities ? `Activities: ${activities}` : ''
                    ].filter(Boolean).join('. ');
                    enquirySuccessWa.href = `https://wa.me/919424904000?text=${encodeURIComponent(waParts)}`;
                }
                enquiryForm.reset();
            } else {
                // Honest failure feedback — NEVER claim submission succeeded
                if (enquiryStatus) {
                    enquiryStatus.hidden = false;
                    enquiryStatus.className = 'starline-enq-status is-error';
                    enquiryStatus.textContent = lastErrorMsg || 'Could not submit your enquiry right now. Please try again or reach us directly on WhatsApp (+91-94249-04000).';
                }
            }
        });

        // Close on Escape or outside click
        document.addEventListener('click', (e) => {
            if (!widget.classList.contains('is-open')) return;
            if (!widget.contains(e.target)) {
                closeChatbot(false);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && widget.classList.contains('is-open')) {
                closeChatbot(true);
            }
        });

        window.openStarlineChatbot = openChatbot;
        window.closeStarlineChatbot = () => closeChatbot(false);
        window.toggleStarlineChatbot = toggleChatbot;
        window.resetStarlineChatbot = performResetChat;
        window.openStarlineChatEnquiry = () => {
            openChatbot();
            showEnquiryView();
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountChatbotWidget);
    } else {
        mountChatbotWidget();
    }
})();
