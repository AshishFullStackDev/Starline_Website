/**
 * Starline Adventures Pvt. Ltd. - Multilingual AI Website Assistant
 * Floating widget, conversation management, inline lead capture & WhatsApp escalation
 */
(function () {
  'use strict';

  if (typeof window === 'undefined' || window.__STARLINE_CHATBOT_INIT__) {
    return;
  }
  window.__STARLINE_CHATBOT_INIT__ = true;

  const STORAGE_KEY = 'starline_ai_chat_session_v1';
  const WHATSAPP_URL = 'https://wa.me/919424904000';
  const PHONE_HREF = 'tel:+919424904000';
  const EMAIL_HREF = 'mailto:starlineadventure@gmail.com';
  const LOGO_URL = '/images/logo/logo.jpeg';

  const WELCOME_MESSAGE = "Hello! Welcome to STARLINE ADVENTURES. I'm your AI assistant. How can I help you with your adventure project today?";

  const INITIAL_SUGGESTIONS = [
    'What equipment do you manufacture?',
    'Tell me about your zipline projects.',
    'I want to develop an adventure park.',
    'I need a quotation.',
    'Contact your sales team.'
  ];

  // ==========================================================
  // SESSION STATE (Privacy-conscious sessionStorage only)
  // ==========================================================
  function generateSessionId() {
    const arr = new Uint8Array(12);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(arr);
    } else {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    return 'sess_' + Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  }

  function formatTime(dateInput) {
    try {
      const d = dateInput ? new Date(dateInput) : new Date();
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function createDefaultState() {
    return {
      sessionId: generateSessionId(),
      isOpen: false,
      detectedLanguage: 'en',
      leadDraft: {
        fullName: '',
        company: '',
        phone: '',
        email: '',
        projectLocation: '',
        projectType: '',
        requiredEquipment: '',
        expectedTimeline: ''
      },
      messages: [
        {
          role: 'assistant',
          text: WELCOME_MESSAGE,
          timestamp: new Date().toISOString(),
          suggestions: INITIAL_SUGGESTIONS
        }
      ],
      leadSubmittedId: null
    };
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.messages) || parsed.messages.length === 0) {
        return createDefaultState();
      }
      return Object.assign(createDefaultState(), parsed);
    } catch (e) {
      return createDefaultState();
    }
  }

  function saveState() {
    try {
      const toStore = {
        sessionId: state.sessionId,
        isOpen: state.isOpen,
        detectedLanguage: state.detectedLanguage,
        leadDraft: state.leadDraft,
        messages: state.messages.slice(-30),
        leadSubmittedId: state.leadSubmittedId
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {}
  }

  let state = loadState();
  let isSending = false;
  let activeLeadFormEl = null;

  // ==========================================================
  // SAFE TEXT FORMATTING (XSS-Safe)
  // ==========================================================
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatMessageHtml(text) {
    const safe = escapeHtml(text || '');
    const lines = safe.split(/\r?\n/);
    let html = '';
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        continue;
      }

      const formattedLine = trimmed
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');

      if (/^[-*•]\s+/.test(trimmed)) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${formattedLine.replace(/^[-*•]\s+/, '')}</li>`;
      } else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<p>${formattedLine}</p>`;
      }
    }

    if (inList) html += '</ul>';
    return html || `<p>${safe}</p>`;
  }

  // ==========================================================
  // DOM CREATION
  // ==========================================================
  function mountWidget() {
    if (document.getElementById('sl-chatbot-root')) return;

    const root = document.createElement('div');
    root.id = 'sl-chatbot-root';
    root.setAttribute('aria-live', 'polite');

    root.innerHTML = `
      <div class="sl-chatbot-launcher-wrap" id="slChatbotLauncherWrap">
        <div class="sl-chatbot-tooltip" id="slChatbotTooltip">Ask Starline AI Assistant</div>
        <button
          type="button"
          class="sl-chatbot-launcher"
          id="slChatbotLauncher"
          aria-label="Open Starline AI Assistant"
          aria-expanded="false"
          aria-controls="slChatbotWindow"
          title="Chat with STARLINE AI ASSISTANT"
        >
          <span class="sl-chatbot-launcher-badge" aria-hidden="true"></span>
          <svg id="slLauncherChatIcon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
            <circle cx="12" cy="10" r="1" fill="currentColor"></circle>
            <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
          </svg>
          <svg id="slLauncherCloseIcon" style="display:none;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <section
        class="sl-chatbot-window"
        id="slChatbotWindow"
        role="dialog"
        aria-modal="false"
        aria-labelledby="slChatbotHeading"
        aria-hidden="true"
      >
        <header class="sl-chatbot-header">
          <div class="sl-chatbot-header-brand">
            <div class="sl-chatbot-avatar">
              <img src="${LOGO_URL}" alt="Starline Adventures logo" class="sl-chatbot-logo-img" />
            </div>
            <div class="sl-chatbot-title-wrap">
              <h2 class="sl-chatbot-heading" id="slChatbotHeading">STARLINE AI ASSISTANT</h2>
              <div class="sl-chatbot-status">
                <span class="sl-chatbot-status-dot" aria-hidden="true"></span>
                <span class="sl-chatbot-status-label">Online</span>
                <span aria-hidden="true">&bull;</span>
                <span aria-label="English, Hindi, Marathi, Hinglish">EN / HI / MR</span>
              </div>
            </div>
          </div>

          <div class="sl-chatbot-header-actions">
            <button
              type="button"
              class="sl-chatbot-icon-btn"
              id="slChatbotHumanBtn"
              aria-label="Talk to a human"
              data-tooltip="Talk to a human"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
            </button>
            <a
              href="${WHATSAPP_URL}"
              target="_blank"
              rel="noopener noreferrer"
              class="sl-chatbot-icon-btn sl-wa-btn"
              aria-label="Chat on WhatsApp"
              data-tooltip="Chat on WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>
            <button
              type="button"
              class="sl-chatbot-icon-btn"
              id="slChatbotClearBtn"
              aria-label="Clear chat"
              data-tooltip="Clear chat"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
              </svg>
            </button>
            <button
              type="button"
              class="sl-chatbot-icon-btn"
              id="slChatbotCloseBtn"
              aria-label="Close chat"
              data-tooltip="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        <div class="sl-chatbot-confirm-bar" id="slChatbotConfirmBar" role="region" aria-label="Confirm clear chat" aria-hidden="true" hidden>
          <p class="sl-chatbot-confirm-text">Clear conversation history?</p>
          <div class="sl-chatbot-confirm-actions">
            <button type="button" class="sl-chatbot-confirm-btn is-cancel" id="slChatbotCancelClearBtn">Cancel</button>
            <button type="button" class="sl-chatbot-confirm-btn is-confirm" id="slChatbotConfirmClearBtn">Clear Chat</button>
          </div>
        </div>

        <div class="sl-chatbot-messages" id="slChatbotMessages" role="log" aria-live="polite" aria-label="Chat messages"></div>

        <div class="sl-chatbot-input-area">
          <div class="sl-chatbot-input-row">
            <textarea
              id="slChatbotInput"
              class="sl-chatbot-textarea"
              rows="1"
              maxlength="1500"
              placeholder="Ask in English, Hindi, Marathi, or Hinglish..."
              aria-label="Type your message"
            ></textarea>
            <button
              type="button"
              id="slChatbotSendBtn"
              class="sl-chatbot-send-btn"
              aria-label="Send message"
              title="Send message"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <p class="sl-chatbot-disclaimer">
            AI can make mistakes. Don't share sensitive info.
            <a href="/contact.html" class="sl-chatbot-privacy-link" id="slChatbotPrivacyLink">Privacy Policy</a>
          </p>
          <div class="sl-chatbot-footer-meta">
            <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">STARLINE ADVENTURES PVT. LTD.</span>
            <div class="sl-chatbot-footer-actions">
              <a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" class="sl-chatbot-footer-wa" aria-label="Chat with Starline Adventures on WhatsApp">WhatsApp</a>
              <a href="${PHONE_HREF}" class="sl-chatbot-footer-phone" aria-label="Call Starline Adventures at +91 94249 04000">+91 94249 04000</a>
            </div>
          </div>
        </div>
      </section>
    `;

    document.body.appendChild(root);

    bindEvents();
    renderAllMessages();

    if (state.isOpen) {
      openWindow(false);
    } else {
      // Show subtle tooltip hint briefly after load for first-time visitors
      setTimeout(() => {
        const wrap = document.getElementById('slChatbotLauncherWrap');
        if (wrap && !state.isOpen) {
          wrap.classList.add('is-hint-visible');
          setTimeout(() => wrap.classList.remove('is-hint-visible'), 4500);
        }
      }, 4500);
    }
  }

  // ==========================================================
  // RENDERING HELPERS
  // ==========================================================
  function hasUserMessages() {
    return Array.isArray(state.messages) && state.messages.some(m => m.role === 'user');
  }

  function scrollToTop() {
    const box = document.getElementById('slChatbotMessages');
    if (box) {
      box.scrollTop = 0;
    }
  }

  function scrollToBottom() {
    const box = document.getElementById('slChatbotMessages');
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }

  function renderAllMessages() {
    const box = document.getElementById('slChatbotMessages');
    if (!box) return;
    box.innerHTML = '';

    state.messages.forEach((msg, index) => {
      const isLast = index === state.messages.length - 1;
      appendMessageElement(msg, isLast);
    });

    if (hasUserMessages()) {
      scrollToBottom();
    } else {
      scrollToTop();
    }
  }

  function appendMessageElement(msg, showSuggestions = true) {
    const box = document.getElementById('slChatbotMessages');
    if (!box) return;

    const row = document.createElement('div');
    row.className = `sl-chatbot-msg-row ${msg.role === 'user' ? 'is-user' : 'is-assistant'}`;

    if (msg.role !== 'user') {
      const avatar = document.createElement('div');
      avatar.className = 'sl-chatbot-msg-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      const img = document.createElement('img');
      img.src = LOGO_URL;
      img.alt = '';
      img.className = 'sl-chatbot-logo-img';
      avatar.appendChild(img);
      row.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = `sl-chatbot-bubble${msg.isError ? ' is-error' : ''}`;
    bubble.innerHTML = `${formatMessageHtml(msg.text)}<span class="sl-chatbot-msg-time">${escapeHtml(formatTime(msg.timestamp))}</span>`;
    row.appendChild(bubble);
    box.appendChild(row);

    if (showSuggestions && Array.isArray(msg.suggestions) && msg.suggestions.length > 0) {
      const sugWrap = document.createElement('div');
      sugWrap.className = 'sl-chatbot-suggestions';
      msg.suggestions.forEach(text => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'sl-chatbot-chip';
        chip.textContent = text;
        chip.addEventListener('click', () => {
          sendMessage(text);
        });
        sugWrap.appendChild(chip);
      });
      box.appendChild(sugWrap);
    }

    if (showSuggestions && msg.shouldOfferLeadForm && !state.leadSubmittedId) {
      appendActionCard({
        title: msg.isError ? 'Need Help Right Away?' : 'Request a Customized Project Quotation',
        desc: msg.isError
          ? 'You can retry your question or reach our team directly via enquiry form or WhatsApp.'
          : 'Share your project details in 30 seconds and our engineering team will prepare a tailored proposal.',
        showFormBtn: true,
        showWhatsapp: true,
        retryText: msg.retryText || ''
      });
    } else if (showSuggestions && msg.escalateToHuman) {
      appendActionCard({
        title: 'Connect with Starline Sales & Engineering Team',
        desc: 'Speak directly with our specialists or share your contact details for a callback.',
        showFormBtn: true,
        showWhatsapp: true,
        showCall: true,
        retryText: msg.retryText || ''
      });
    }
  }

  function appendTypingIndicator() {
    removeTypingIndicator();
    const box = document.getElementById('slChatbotMessages');
    if (!box) return;
    const row = document.createElement('div');
    row.className = 'sl-chatbot-msg-row is-assistant';
    row.id = 'slChatbotTypingRow';
    row.innerHTML = `
      <div class="sl-chatbot-msg-avatar" aria-hidden="true">
        <img src="${LOGO_URL}" alt="" class="sl-chatbot-logo-img" />
      </div>
      <div class="sl-chatbot-typing" aria-label="Starline AI Assistant is typing">
        <span></span><span></span><span></span>
      </div>
    `;
    box.appendChild(row);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const existing = document.getElementById('slChatbotTypingRow');
    if (existing) existing.remove();
  }

  function appendActionCard({ title, desc, showFormBtn = true, showWhatsapp = false, showCall = false, retryText = '' }) {
    const box = document.getElementById('slChatbotMessages');
    if (!box) return;

    const card = document.createElement('div');
    card.className = 'sl-chatbot-card';

    const titleEl = document.createElement('h4');
    titleEl.className = 'sl-chatbot-card-title';
    titleEl.textContent = title;
    card.appendChild(titleEl);

    const descEl = document.createElement('p');
    descEl.className = 'sl-chatbot-card-desc';
    descEl.textContent = desc;
    card.appendChild(descEl);

    const actions = document.createElement('div');
    actions.className = 'sl-chatbot-card-actions';

    if (retryText) {
      const retryBtn = document.createElement('button');
      retryBtn.type = 'button';
      retryBtn.className = 'sl-chatbot-action-btn is-dark';
      retryBtn.textContent = 'Try Again';
      retryBtn.addEventListener('click', () => {
        card.remove();
        sendMessage(retryText);
      });
      actions.appendChild(retryBtn);
    }

    if (showFormBtn) {
      const formBtn = document.createElement('button');
      formBtn.type = 'button';
      formBtn.className = 'sl-chatbot-action-btn is-orange';
      formBtn.textContent = 'Open Enquiry Form';
      formBtn.addEventListener('click', () => openInlineLeadForm());
      actions.appendChild(formBtn);
    }

    if (showWhatsapp) {
      const waBtn = document.createElement('a');
      waBtn.className = 'sl-chatbot-action-btn is-wa';
      waBtn.href = WHATSAPP_URL;
      waBtn.target = '_blank';
      waBtn.rel = 'noopener noreferrer';
      waBtn.textContent = 'WhatsApp Team';
      actions.appendChild(waBtn);
    }

    if (showCall) {
      const callBtn = document.createElement('a');
      callBtn.className = 'sl-chatbot-action-btn is-dark';
      callBtn.href = PHONE_HREF;
      callBtn.textContent = 'Call +91 94249 04000';
      actions.appendChild(callBtn);

      const mailBtn = document.createElement('a');
      mailBtn.className = 'sl-chatbot-action-btn is-ghost';
      mailBtn.href = EMAIL_HREF;
      mailBtn.textContent = 'Email Us';
      actions.appendChild(mailBtn);
    }

    if (actions.children.length > 0) {
      card.appendChild(actions);
    }
    box.appendChild(card);
    scrollToBottom();
  }

  // ==========================================================
  // INLINE LEAD CAPTURE FORM
  // ==========================================================
  function buildConversationSummary() {
    return state.messages
      .slice(-8)
      .map(m => `${m.role === 'user' ? 'Visitor' : 'Assistant'}: ${m.text}`)
      .join('\n')
      .slice(0, 1800);
  }

  function openInlineLeadForm() {
    const box = document.getElementById('slChatbotMessages');
    if (!box) return;

    if (activeLeadFormEl && activeLeadFormEl.isConnected) {
      activeLeadFormEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const firstInput = activeLeadFormEl.querySelector('input[name="fullName"]');
      if (firstInput) firstInput.focus();
      return;
    }

    const d = state.leadDraft || {};
    const formCard = document.createElement('div');
    formCard.className = 'sl-chatbot-lead-form';
    formCard.innerHTML = `
      <div class="sl-chatbot-lead-header">
        <h4>Project Enquiry &amp; Quotation Form</h4>
        <button type="button" class="sl-chatbot-lead-close" aria-label="Close form" title="Close form">&times;</button>
      </div>
      <form class="sl-chatbot-form-grid" novalidate>
        <input type="text" name="website_hp" class="sl-chatbot-hp" tabindex="-1" autocomplete="off" aria-hidden="true">

        <div class="sl-chatbot-field">
          <label for="slLeadName">Full Name <span>*</span></label>
          <input id="slLeadName" name="fullName" type="text" required minlength="2" maxlength="100" placeholder="Your full name" value="${escapeHtml(d.fullName || '')}">
        </div>

        <div class="sl-chatbot-field">
          <label for="slLeadCompany">Company / Organisation</label>
          <input id="slLeadCompany" name="company" type="text" maxlength="120" placeholder="Resort / Firm / Org" value="${escapeHtml(d.company || '')}">
        </div>

        <div class="sl-chatbot-field">
          <label for="slLeadPhone">Phone Number <span>*</span></label>
          <input id="slLeadPhone" name="phone" type="tel" required minlength="8" maxlength="30" placeholder="+91 98XXXXXXXX" value="${escapeHtml(d.phone || '')}">
        </div>

        <div class="sl-chatbot-field">
          <label for="slLeadEmail">Email Address <span>*</span></label>
          <input id="slLeadEmail" name="email" type="email" required maxlength="120" placeholder="you@company.com" value="${escapeHtml(d.email || '')}">
        </div>

        <div class="sl-chatbot-field">
          <label for="slLeadLocation">Project Location</label>
          <input id="slLeadLocation" name="projectLocation" type="text" maxlength="120" placeholder="City, State" value="${escapeHtml(d.projectLocation || '')}">
        </div>

        <div class="sl-chatbot-field">
          <label for="slLeadType">Project Type</label>
          <select id="slLeadType" name="projectType">
            <option value="">Select project type</option>
            <option value="Resort / Hospitality">Resort / Hospitality</option>
            <option value="Adventure Park">Adventure Park</option>
            <option value="Builder / Real Estate">Builder / Real Estate</option>
            <option value="Architect / Consultant">Architect / Consultant</option>
            <option value="Tourism Destination">Tourism Destination</option>
            <option value="Educational Institution">Educational Institution</option>
            <option value="Government Project">Government Project</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="sl-chatbot-field is-full">
          <label for="slLeadEquip">Required Activities / Equipment</label>
          <input id="slLeadEquip" name="requiredEquipment" type="text" maxlength="500" placeholder="e.g. Zipline, Giant Swing, Rope Course, Climbing Wall" value="${escapeHtml(d.requiredEquipment || '')}">
        </div>

        <div class="sl-chatbot-field is-full">
          <label for="slLeadTimeline">Expected Project Timeline</label>
          <input id="slLeadTimeline" name="expectedTimeline" type="text" maxlength="100" placeholder="e.g. Within 2–3 months, Q3 2026" value="${escapeHtml(d.expectedTimeline || '')}">
        </div>

        <div class="sl-chatbot-field is-full">
          <label for="slLeadNotes">Additional Project Notes</label>
          <textarea id="slLeadNotes" name="notes" rows="2" maxlength="1500" placeholder="Site span, terrain, or specific questions..."></textarea>
        </div>

        <label class="sl-chatbot-consent">
          <input type="checkbox" name="consentGiven" required>
          <span>I consent to STARLINE ADVENTURES PVT. LTD. storing my details and contacting me via phone, email, or WhatsApp regarding this project enquiry.</span>
        </label>

        <div class="sl-chatbot-form-error" role="alert"></div>

        <button type="submit" class="sl-chatbot-submit-btn">Submit Enquiry &rarr;</button>
      </form>
    `;

    // Pre-select matching projectType if extracted
    const typeSelect = formCard.querySelector('#slLeadType');
    if (typeSelect && d.projectType) {
      const match = Array.from(typeSelect.options).find(opt =>
        opt.value.toLowerCase().includes(String(d.projectType).toLowerCase()) ||
        String(d.projectType).toLowerCase().includes(opt.value.toLowerCase())
      );
      if (match) typeSelect.value = match.value;
    }

    const closeBtn = formCard.querySelector('.sl-chatbot-lead-close');
    closeBtn.addEventListener('click', () => {
      formCard.remove();
      activeLeadFormEl = null;
    });

    const formEl = formCard.querySelector('form');
    const errorEl = formCard.querySelector('.sl-chatbot-form-error');
    const submitBtn = formCard.querySelector('.sl-chatbot-submit-btn');

    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');

      const fd = new FormData(formEl);
      const payload = {
        website_hp: String(fd.get('website_hp') || ''),
        fullName: String(fd.get('fullName') || '').trim(),
        company: String(fd.get('company') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        email: String(fd.get('email') || '').trim(),
        projectLocation: String(fd.get('projectLocation') || '').trim(),
        projectType: String(fd.get('projectType') || '').trim(),
        requiredEquipment: String(fd.get('requiredEquipment') || '').trim(),
        expectedTimeline: String(fd.get('expectedTimeline') || '').trim(),
        notes: String(fd.get('notes') || '').trim(),
        consentGiven: Boolean(formEl.querySelector('input[name="consentGiven"]')?.checked),
        sourcePage: window.location.href,
        language: state.detectedLanguage || 'en',
        conversationSummary: buildConversationSummary()
      };

      if (payload.fullName.length < 2) {
        errorEl.textContent = 'Please enter your full name (minimum 2 characters).';
        errorEl.classList.add('is-visible');
        return;
      }
      if (payload.phone.replace(/[^\d]/g, '').length < 8) {
        errorEl.textContent = 'Please enter a valid phone number (minimum 8 digits).';
        errorEl.classList.add('is-visible');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        errorEl.textContent = 'Please enter a valid email address.';
        errorEl.classList.add('is-visible');
        return;
      }
      if (!payload.consentGiven) {
        errorEl.textContent = 'Please check the consent box before submitting your details.';
        errorEl.classList.add('is-visible');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        const res = await fetch('/api/chatbot/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Unable to submit enquiry right now.');
        }

        state.leadSubmittedId = data.leadId || 'CONFIRMED';
        state.leadDraft = Object.assign(state.leadDraft, {
          fullName: payload.fullName,
          company: payload.company,
          phone: payload.phone,
          email: payload.email,
          projectLocation: payload.projectLocation,
          projectType: payload.projectType,
          requiredEquipment: payload.requiredEquipment,
          expectedTimeline: payload.expectedTimeline
        });

        formCard.remove();
        activeLeadFormEl = null;

        const confirmMsg = {
          role: 'assistant',
          text: `Thank you, **${payload.fullName}**! Your enquiry has been submitted (Reference: **${state.leadSubmittedId}**). Our sales & engineering team will review your requirements and reach out shortly.`,
          timestamp: new Date().toISOString(),
          escalateToHuman: true
        };
        state.messages.push(confirmMsg);
        saveState();
        appendMessageElement(confirmMsg, true);
        scrollToBottom();
      } catch (err) {
        errorEl.textContent = err && err.message ? err.message : 'Submission failed. Please try again.';
        errorEl.classList.add('is-visible');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Enquiry →';
      }
    });

    activeLeadFormEl = formCard;
    box.appendChild(formCard);
    scrollToBottom();
    const firstInput = formCard.querySelector('#slLeadName');
    if (firstInput) firstInput.focus();
  }

  // ==========================================================
  // CHAT MESSAGING FLOW
  // ==========================================================
  async function sendMessage(rawText) {
    const text = String(rawText || '').trim();
    if (!text || isSending) return;

    const inputEl = document.getElementById('slChatbotInput');
    const sendBtn = document.getElementById('slChatbotSendBtn');

    if (inputEl) {
      inputEl.value = '';
      inputEl.style.height = 'auto';
    }

    // Clear old suggestion chips / inline cards from display when user sends next message
    document.querySelectorAll('#slChatbotMessages .sl-chatbot-suggestions').forEach(el => el.remove());

    const userMsg = {
      role: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    state.messages.push(userMsg);
    saveState();
    appendMessageElement(userMsg, false);
    scrollToBottom();

    isSending = true;
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.classList.add('is-loading');
      sendBtn.setAttribute('aria-busy', 'true');
    }
    appendTypingIndicator();

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutTimer = controller ? setTimeout(() => controller.abort(), 30000) : null;

    try {
      const historyPayload = state.messages
        .slice(-13, -1)
        .filter(m => m && !m.isError && m.text)
        .map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));

      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller ? controller.signal : undefined,
        body: JSON.stringify({
          sessionId: state.sessionId,
          message: text,
          sourcePage: window.location.href,
          history: historyPayload
        })
      });

      const data = await res.json().catch(() => ({}));
      removeTypingIndicator();

      if (!res.ok || !data.ok || !data.reply) {
        const errMsg = data.error || 'Our AI assistant is temporarily unavailable. You can still submit your enquiry or contact us directly.';
        const fallbackMsg = {
          role: 'assistant',
          text: errMsg,
          timestamp: new Date().toISOString(),
          isError: true,
          retryText: text,
          shouldOfferLeadForm: true,
          escalateToHuman: true
        };
        state.messages.push(fallbackMsg);
        saveState();
        appendMessageElement(fallbackMsg, true);
        scrollToBottom();
        return;
      }

      if (data.sessionId) state.sessionId = data.sessionId;
      if (data.detectedLanguage) state.detectedLanguage = data.detectedLanguage;

      if (data.extractedLead && typeof data.extractedLead === 'object') {
        for (const [key, val] of Object.entries(data.extractedLead)) {
          if (val && typeof val === 'string' && val.trim()) {
            state.leadDraft[key] = val.trim();
          }
        }
      }

      const assistantMsg = {
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toISOString(),
        suggestions: Array.isArray(data.suggestedReplies) ? data.suggestedReplies : [],
        shouldOfferLeadForm: Boolean(data.shouldOfferLeadForm),
        escalateToHuman: Boolean(data.escalateToHuman)
      };

      state.messages.push(assistantMsg);
      saveState();
      appendMessageElement(assistantMsg, true);
      scrollToBottom();
    } catch (networkErr) {
      removeTypingIndicator();
      const isTimeout = networkErr && networkErr.name === 'AbortError';
      const offlineMsg = {
        role: 'assistant',
        text: isTimeout
          ? 'The AI response took longer than expected. Please try again or reach our team directly on WhatsApp (+91 94249 04000).'
          : 'Network connection interrupted. You can still fill out an enquiry form below or reach our team directly on WhatsApp (+91 94249 04000).',
        timestamp: new Date().toISOString(),
        isError: true,
        retryText: text,
        shouldOfferLeadForm: true,
        escalateToHuman: true
      };
      state.messages.push(offlineMsg);
      saveState();
      appendMessageElement(offlineMsg, true);
      scrollToBottom();
    } finally {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      isSending = false;
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.classList.remove('is-loading');
        sendBtn.removeAttribute('aria-busy');
      }
      if (inputEl) inputEl.focus();
    }
  }

  // ==========================================================
  // OPEN / CLOSE / CLEAR / PRIVACY CONTROLS
  // ==========================================================
  function showClearConfirmation() {
    const bar = document.getElementById('slChatbotConfirmBar');
    if (!bar) {
      clearConversation();
      return;
    }
    bar.classList.add('is-visible');
    bar.setAttribute('aria-hidden', 'false');
    const cancelBtn = document.getElementById('slChatbotCancelClearBtn');
    if (cancelBtn) cancelBtn.focus();
  }

  function hideClearConfirmation(returnFocusToClear = false) {
    const bar = document.getElementById('slChatbotConfirmBar');
    if (bar) {
      bar.classList.remove('is-visible');
      bar.setAttribute('aria-hidden', 'true');
    }
    if (returnFocusToClear) {
      const clearBtn = document.getElementById('slChatbotClearBtn');
      if (clearBtn) clearBtn.focus();
    }
  }

  function showPrivacyNotice() {
    appendActionCard({
      title: 'Privacy Policy & Data Handling',
      desc: 'Chat messages are kept in temporary browser session storage. Project enquiry details are only submitted and stored after your explicit consent to respond to your request. Contact starlineadventure@gmail.com for data queries.',
      showFormBtn: false,
      showWhatsapp: false,
      showCall: false
    });
  }

  function openWindow(focusInput = true) {
    const win = document.getElementById('slChatbotWindow');
    const launcher = document.getElementById('slChatbotLauncher');
    const chatIcon = document.getElementById('slLauncherChatIcon');
    const closeIcon = document.getElementById('slLauncherCloseIcon');
    const wrap = document.getElementById('slChatbotLauncherWrap');
    if (!win || !launcher) return;

    win.classList.add('is-open');
    win.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sl-chatbot-window-open');
    launcher.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    launcher.setAttribute('aria-label', 'Close Starline AI Assistant');
    if (wrap) wrap.classList.remove('is-hint-visible');
    if (chatIcon) chatIcon.style.display = 'none';
    if (closeIcon) closeIcon.style.display = 'block';

    state.isOpen = true;
    saveState();

    const syncScroll = () => {
      if (hasUserMessages() || activeLeadFormEl) {
        scrollToBottom();
      } else {
        scrollToTop();
      }
    };
    syncScroll();
    requestAnimationFrame(syncScroll);

    if (focusInput) {
      setTimeout(() => {
        const input = document.getElementById('slChatbotInput');
        if (input) input.focus({ preventScroll: true });
      }, 120);
    }
  }

  function closeWindow(returnFocus = true) {
    const win = document.getElementById('slChatbotWindow');
    const launcher = document.getElementById('slChatbotLauncher');
    const chatIcon = document.getElementById('slLauncherChatIcon');
    const closeIcon = document.getElementById('slLauncherCloseIcon');
    if (!win || !launcher) return;

    hideClearConfirmation(false);
    win.classList.remove('is-open');
    win.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sl-chatbot-window-open');
    launcher.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', 'Open Starline AI Assistant');
    if (chatIcon) chatIcon.style.display = 'block';
    if (closeIcon) closeIcon.style.display = 'none';

    state.isOpen = false;
    saveState();

    if (returnFocus) {
      launcher.focus();
    }
  }

  function clearConversation() {
    hideClearConfirmation(false);
    activeLeadFormEl = null;
    state = createDefaultState();
    state.isOpen = true;
    saveState();
    renderAllMessages();
    scrollToTop();
    const input = document.getElementById('slChatbotInput');
    if (input) input.focus({ preventScroll: true });
  }

  // ==========================================================
  // EVENT BINDING
  // ==========================================================
  function bindEvents() {
    const launcher = document.getElementById('slChatbotLauncher');
    const closeBtn = document.getElementById('slChatbotCloseBtn');
    const clearBtn = document.getElementById('slChatbotClearBtn');
    const cancelClearBtn = document.getElementById('slChatbotCancelClearBtn');
    const confirmClearBtn = document.getElementById('slChatbotConfirmClearBtn');
    const humanBtn = document.getElementById('slChatbotHumanBtn');
    const privacyLink = document.getElementById('slChatbotPrivacyLink');
    const sendBtn = document.getElementById('slChatbotSendBtn');
    const inputEl = document.getElementById('slChatbotInput');

    if (launcher) {
      launcher.addEventListener('click', () => {
        if (state.isOpen) closeWindow(true);
        else openWindow(true);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeWindow(true));
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => showClearConfirmation());
    }

    if (cancelClearBtn) {
      cancelClearBtn.addEventListener('click', () => hideClearConfirmation(true));
    }

    if (confirmClearBtn) {
      confirmClearBtn.addEventListener('click', () => clearConversation());
    }

    if (humanBtn) {
      humanBtn.addEventListener('click', () => {
        appendActionCard({
          title: 'Speak Directly With Our Team',
          desc: 'Connect instantly on WhatsApp, call us, or send a structured enquiry for a priority callback.',
          showFormBtn: true,
          showWhatsapp: true,
          showCall: true
        });
      });
    }

    if (privacyLink) {
      privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPrivacyNotice();
      });
    }

    if (sendBtn && inputEl) {
      sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
    }

    if (inputEl) {
      inputEl.addEventListener('input', () => {
        inputEl.style.height = 'auto';
        inputEl.style.height = Math.min(inputEl.scrollHeight, 96) + 'px';
      });

      inputEl.addEventListener('focus', () => {
        if (hasUserMessages()) {
          setTimeout(scrollToBottom, 180);
        }
      });

      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage(inputEl.value);
        }
      });
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        if (state.isOpen && hasUserMessages()) {
          scrollToBottom();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen) {
        const confirmBar = document.getElementById('slChatbotConfirmBar');
        if (confirmBar && confirmBar.classList.contains('is-visible')) {
          hideClearConfirmation(true);
        } else {
          closeWindow(true);
        }
      }
    });
  }

  // Expose public API for testing or custom triggers
  window.StarlineChatbot = {
    open: () => openWindow(true),
    close: () => closeWindow(true),
    clear: clearConversation,
    openLeadForm: openInlineLeadForm
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWidget);
  } else {
    mountWidget();
  }
})();
