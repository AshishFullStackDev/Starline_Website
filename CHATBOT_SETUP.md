# STARLINE ADVENTURES — AI Website Chatbot Setup, Testing & Deployment Guide

## 1. Architecture Overview

- **Frontend Widget**:
  - `css/chatbot.css` — Scoped `#sl-chatbot-root` / `.sl-chatbot-*` floating widget styles (`#F47621`, `#171717`, `#FFFFFF`, `#F7F7F7`), responsive desktop/mobile layout, positioned above `.whatsapp-float`.
  - `js/chatbot.js` — Multilingual conversational UI, session context (`sessionStorage`), typing indicator, 5 suggested questions, dynamic follow-up chips, inline structured lead capture form with consent verification, WhatsApp & human escalation actions, and graceful AI-unavailable fallback.
  - Integrated directly into all 10 main HTML pages (`index.html`, `about.html`, `contact.html`, `gallery.html`, `portfolio.html`, `products.html`, `project-details.html`, `team.html`, `testimonials.html`, `thank-you.html`) and auto-bootstrapped via `js/script.js` for all `/product/*.html` pages.
- **Backend API (`server/chatbot.js` mounted in `server/server.js`)**:
  - `POST /api/chatbot/message` — Server-side Gemini AI (`@google/genai`, model `gemini-4-hydrogen`) with verified company knowledge, automatic language detection (English, Hindi, Marathi, Hinglish, and more), conversation history, structured lead extraction, and rate limiting.
  - `POST /api/chatbot/leads` — Validates and sanitizes lead inputs, enforces explicit consent (`consentGiven === true`), prevents duplicate submissions, saves to Firebase Firestore collection `website_chatbot_leads` (plus `.secure_store/chatbot_leads.json` backup), and dispatches email notifications via Nodemailer to `starlineadventure@gmail.com`.
  - `GET /api/chatbot/leads` — Admin-protected retrieval endpoint (`Authorization: Bearer <ADMIN_SECRET>` or `X-Admin-Secret`).
- **Database & Security Rules**:
  - `firebase-blueprint.json` — Defines the `ChatbotLead` entity and `/website_chatbot_leads/{leadId}` collection.
  - `firestore.rules` — Enforces `isValidId(leadId)` and `isValidChatbotLead(incoming())` on `create`, and restricts `get`, `list`, `update`, `delete` strictly to verified admins (`isAdmin()`).

---

## 2. Environment Configuration (`.env`)

Copy `.env.example` to `.env` and configure the server secrets (never expose these in frontend JS):

```env
NODE_ENV=production
ALLOWED_ORIGINS=https://starlineadventure.com,https://www.starlineadventure.com

# Required for Gemini AI responses
GEMINI_API_KEY=your_gemini_api_key

# Required for Nodemailer email notifications to starlineadventure@gmail.com
EMAIL_USER=starlineadventure@gmail.com
EMAIL_APP_PASSWORD=your_16_char_google_app_password

# Admin secret for protected /api/chatbot/leads diagnostics
ADMIN_SECRET=your_strong_admin_secret
```

---

## 3. Installation & Local Testing

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the Express server on port 3000**:
   ```bash
   npm run dev
   ```
3. **Test Backend APIs**:
   ```bash
   # Health check
   curl http://localhost:3000/api/health

   # Test multilingual chatbot response (requires GEMINI_API_KEY)
   curl -X POST http://localhost:3000/api/chatbot/message \
     -H "Content-Type: application/json" \
     -d '{"message":"Aap zipline setup karte ho kya? Price kitna hoga?","sourcePage":"http://localhost:3000/"}'

   # Test lead submission (stores in Firestore website_chatbot_leads + sends email if SMTP configured)
   curl -X POST http://localhost:3000/api/chatbot/leads \
     -H "Content-Type: application/json" \
     -d '{"fullName":"Test Client","company":"Test Resort","phone":"+91 9876543210","email":"client@example.com","projectLocation":"Pune, Maharashtra","projectType":"Resort / Hospitality","requiredEquipment":"Zipline, Giant Swing","expectedTimeline":"3 months","consentGiven":true,"sourcePage":"http://localhost:3000/"}'
   ```

---

## 4. Deployment Instructions

1. **Deploy Updated Firestore Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```
   *(Required once so your Firebase project `starline-website-f2f87` accepts client/REST creates on `website_chatbot_leads`.)*
2. **Set Production Environment Variables** on your Node.js host (`GEMINI_API_KEY`, `EMAIL_USER`, `EMAIL_APP_PASSWORD`, `ADMIN_SECRET`, `ALLOWED_ORIGINS`, `NODE_ENV=production`).
3. **Build & Start**:
   ```bash
   npm run build
   npm start
   ```
