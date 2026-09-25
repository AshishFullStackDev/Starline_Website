require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const compression = require('compression');
const StarlineImageMap = require('./js/image-map.js');

// Firebase Modular SDK
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, getDocs, collection, getDocFromServer } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
app.set('env', NODE_ENV);
app.set('trust proxy', 1);

// Hide Express framework signature
app.disable('x-powered-by');

// Enable Gzip/Deflate compression for HTML, CSS, JS, JSON payloads
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// ============================================================
// 1. HTTP SECURITY HEADERS
// ============================================================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Content Security Policy
  // Preserves AI Studio preview iframe, Google Maps embeds, and Firebase SDK
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com",
    "frame-src 'self' https://maps.google.com https://*.firebaseapp.com",
    "frame-ancestors 'self' https://*.google.com https://localhost.corp.google.com:26001 https://*.run.app"
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
  next();
});

// ============================================================
// 2. SENSITIVE FILE ACCESS PROTECTION
// Blocks direct web access to server code, dotfiles, and config
// ============================================================
const BLOCKED_FILENAMES = new Set([
  '.env',
  '.env.example',
  '.gitignore',
  'server.js',
  'package.json',
  'package-lock.json',
  'bun.lock',
  'firestore.rules',
  'firebase-blueprint.json',
  'firebase-applet-config.json',
  'active_gallery_data.json',
  'classified_gallery.json',
  'classified_gallery_images.json',
  'gallery_classification.json',
  'generate_starline_logo.js',
  'readme.md'
]);

app.use((req, res, next) => {
  const normalizedPath = req.path.toLowerCase();
  const segments = normalizedPath.split('/').filter(Boolean);

  // Block any dotfiles or dot-directories
  if (segments.some(seg => seg.startsWith('.'))) {
    return res.status(404).send('Not Found');
  }

  // Block sensitive server files
  const filename = path.basename(normalizedPath);
  if (BLOCKED_FILENAMES.has(filename) || normalizedPath.endsWith('.rules') || normalizedPath.endsWith('.lock')) {
    return res.status(404).send('Not Found');
  }

  next();
});

// ============================================================
// 3. CORS CONFIGURATION
// ============================================================
const DEFAULT_ALLOWED_ORIGINS = [
  'https://starlineadventures.com',
  'https://www.starlineadventures.com'
];

function isOriginAllowed(origin) {
  if (!origin) return true; // same-origin or server-to-server

  const normalized = origin.toLowerCase().trim();
  if (DEFAULT_ALLOWED_ORIGINS.includes(normalized)) return true;

  if (process.env.ALLOWED_ORIGINS) {
    const customAllowed = process.env.ALLOWED_ORIGINS
      .split(',')
      .map(o => o.trim().toLowerCase());
    if (customAllowed.includes(normalized)) return true;
  }

  // Allow preview & local development environments
  const isDevOrPreview = NODE_ENV !== 'production' ||
    normalized.includes('.run.app') ||
    normalized.includes('localhost') ||
    normalized.includes('127.0.0.1');

  if (isDevOrPreview && (normalized.includes('.run.app') || normalized.includes('localhost') || normalized.includes('127.0.0.1'))) {
    return true;
  }

  return false;
}

app.use((req, res, next) => {
  const origin = req.headers['origin'];

  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Secret');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.method === 'OPTIONS') {
    if (origin && !isOriginAllowed(origin)) {
      return res.status(403).json({ ok: false, error: 'Forbidden cross-origin preflight.' });
    }
    return res.sendStatus(204);
  }

  // Guard sensitive POST endpoints against cross-origin forgery
  if (origin && !isOriginAllowed(origin) && (req.path.startsWith('/api/enquiry') || req.path.startsWith('/api/rfq') || req.path.startsWith('/api/quote'))) {
    return res.status(403).json({ ok: false, error: 'Unauthorized cross-origin submission.' });
  }

  next();
});

// ============================================================
// 4. REQUEST BODY PARSING & ERROR HANDLING
// Strict size limits to prevent Denial-of-Service
// ============================================================
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ limit: '50kb', extended: true }));

// Malformed JSON parser error interceptor
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ ok: false, error: 'Malformed JSON payload.' });
  }
  next(err);
});

// ============================================================
// 5. SECURE RATE LIMITING
// Separate rate limits for general APIs and submissions
// ============================================================
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

// Enquiry rate limiter: max 5 requests per 10 minutes per IP
const enquiryRateLimitMap = new Map();
const ENQUIRY_WINDOW_MS = 10 * 60 * 1000;
const ENQUIRY_MAX_REQUESTS = 5;

function checkEnquiryRateLimit(ip) {
  const now = Date.now();
  const timestamps = (enquiryRateLimitMap.get(ip) || []).filter(ts => now - ts < ENQUIRY_WINDOW_MS);
  if (timestamps.length >= ENQUIRY_MAX_REQUESTS) {
    return false;
  }
  timestamps.push(now);
  enquiryRateLimitMap.set(ip, timestamps);
  return true;
}

// Global API rate limiter: max 120 requests per 5 minutes per IP
const apiRateLimitMap = new Map();
const API_WINDOW_MS = 5 * 60 * 1000;
const API_MAX_REQUESTS = 120;

function checkApiRateLimit(ip) {
  const now = Date.now();
  const timestamps = (apiRateLimitMap.get(ip) || []).filter(ts => now - ts < API_WINDOW_MS);
  if (timestamps.length >= API_MAX_REQUESTS) {
    return false;
  }
  timestamps.push(now);
  apiRateLimitMap.set(ip, timestamps);
  return true;
}

// Periodic cleanup of rate limiter maps
setInterval(() => {
  const now = Date.now();
  for (const [ip, list] of enquiryRateLimitMap.entries()) {
    const valid = list.filter(ts => now - ts < ENQUIRY_WINDOW_MS);
    if (valid.length === 0) enquiryRateLimitMap.delete(ip);
    else enquiryRateLimitMap.set(ip, valid);
  }
  for (const [ip, list] of apiRateLimitMap.entries()) {
    const valid = list.filter(ts => now - ts < API_WINDOW_MS);
    if (valid.length === 0) apiRateLimitMap.delete(ip);
    else apiRateLimitMap.set(ip, valid);
  }
}, 5 * 60 * 1000);

// Deduplication Store
const recentSubmissions = new Map();
const DUP_WINDOW_MS = 2 * 60 * 1000;

function checkDuplicateSubmission(fingerprint) {
  const now = Date.now();
  const existing = recentSubmissions.get(fingerprint);
  if (existing && (now - existing.timestamp < DUP_WINDOW_MS)) {
    return existing.enquiryId;
  }
  return null;
}

function recordSubmissionFingerprint(fingerprint, enquiryId) {
  recentSubmissions.set(fingerprint, { enquiryId, timestamp: Date.now() });
}

setInterval(() => {
  const now = Date.now();
  for (const [fp, data] of recentSubmissions.entries()) {
    if (now - data.timestamp > DUP_WINDOW_MS) {
      recentSubmissions.delete(fp);
    }
  }
}, 5 * 60 * 1000);

// Helper to mask email for logs
function maskEmail(email) {
  if (!email || !email.includes('@')) return '***';
  const [user, domain] = email.split('@');
  const maskedUser = user.length > 2 ? user.slice(0, 2) + '***' : '***';
  return `${maskedUser}@${domain}`;
}

// ============================================================
// 6. SECURE ENQUIRIES LOCAL BACKUP STORE
// ============================================================
const SECURE_STORE_DIR = path.join(__dirname, '.secure_store');
const SECURE_STORE_FILE = path.join(SECURE_STORE_DIR, 'enquiries.json');

try {
  if (!fs.existsSync(SECURE_STORE_DIR)) {
    fs.mkdirSync(SECURE_STORE_DIR, { mode: 0o700, recursive: true });
  }
  if (!fs.existsSync(SECURE_STORE_FILE)) {
    fs.writeFileSync(SECURE_STORE_FILE, '[]', { encoding: 'utf8', mode: 0o600 });
  }
} catch (storeErr) {
  console.warn('[Secure Store Warning]: Could not create storage directory:', storeErr.message);
}

function saveEnquirySecurely(record) {
  try {
    if (!fs.existsSync(SECURE_STORE_DIR)) {
      fs.mkdirSync(SECURE_STORE_DIR, { mode: 0o700, recursive: true });
    }
    let list = [];
    if (fs.existsSync(SECURE_STORE_FILE)) {
      const content = fs.readFileSync(SECURE_STORE_FILE, 'utf8');
      list = JSON.parse(content || '[]');
    }
    list.unshift(record);
    if (list.length > 500) list = list.slice(0, 500); // retain last 500
    fs.writeFileSync(SECURE_STORE_FILE, JSON.stringify(list, null, 2), { encoding: 'utf8', mode: 0o600 });
  } catch (err) {
    console.error('[Secure Store Error]: Failed to save record locally:', err.message);
  }
}

function getStoredEnquiries() {
  try {
    if (fs.existsSync(SECURE_STORE_FILE)) {
      const content = fs.readFileSync(SECURE_STORE_FILE, 'utf8');
      return JSON.parse(content || '[]');
    }
  } catch (err) {
    console.error('[Secure Store Read Error]:', err.message);
  }
  return [];
}

// ============================================================
// 7. FIREBASE INITIALIZATION & CONNECTION TEST
// ============================================================
let db = null;
let auth = null;
let firebaseConfig = null;

try {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(firebaseApp);
    console.log('[Firebase Initialized]: Connected to Firestore database:', firebaseConfig.firestoreDatabaseId);

    // Test connection on boot
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log('[Firebase Connection]: Firestore connectivity verified.');
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error('[Firebase Notice]: Client appears offline, check network configuration.');
        } else {
          console.log('[Firebase Connection]: Probe finished.');
        }
      }
    }
    testConnection();
  } else {
    console.warn('[Firebase Notice]: firebase-applet-config.json not found.');
  }
} catch (fbErr) {
  console.error('[Firebase Init Error]:', fbErr.message);
}

// HTML escape helper for XSS prevention in email templates
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// String sanitizer: strip dangerous HTML angle brackets
function sanitizeInput(str) {
  if (!str) return '';
  return String(str).replace(/[<>]/g, '').trim();
}

// ============================================================
// 8. NOTIFICATION EMAIL DISPATCHERS
// ============================================================
async function sendNotificationEmail(record) {
  const emailUser = process.env.EMAIL_USER || 'starlineadventure@gmail.com';
  const emailAppPassword = process.env.EMAIL_APP_PASSWORD;
  const targetRecipient = 'starlineadventure@gmail.com';

  if (!emailAppPassword) {
    console.warn(`[Gmail SMTP Notice]: EMAIL_APP_PASSWORD not configured. Enquiry [${record.id}] saved, email skipped.`);
    return { sent: false, reason: 'EMAIL_APP_PASSWORD not set' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailAppPassword.replace(/\s+/g, '')
    }
  });

  const isRfq = record.formType === 'Quick RFQ' ||
    (record.subject && record.subject.toLowerCase().includes('rfq')) ||
    (record.message && record.message.toLowerCase().includes('quote request'));

  const formLabel = isRfq ? 'Quick RFQ' : 'Contact Form Enquiry';
  const emailSubject = `[${formLabel}] ${record.name} - ${record.product}`;
  const cleanPhone = (record.phone || '').replace(/[^\d+]/g, '');
  const formattedDate = new Date(record.createdAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const plainText = `
============================================================
STARLINE ADVENTURES - ${formLabel.toUpperCase()}
============================================================

A new ${formLabel.toLowerCase()} has been received through the website.

Lead Reference ID: ${record.id}
Date & Time:       ${formattedDate} (IST)
Submission Source: ${record.formType}

CUSTOMER DETAILS:
------------------------------------------------------------
- Name:             ${record.name}
- Email:            ${record.email}
- Phone:            ${record.phone}
- Company/Org:      ${record.company || 'N/A'}
- Project Location: ${record.location}

PROJECT / ACTIVITY INTEREST:
------------------------------------------------------------
- Product/Activity: ${record.product}

MESSAGE / PROJECT REQUIREMENTS:
------------------------------------------------------------
${record.message || 'No additional message provided.'}

------------------------------------------------------------
To respond directly to this customer, reply to this email or contact:
Phone/WhatsApp: ${record.phone}
Email: ${record.email}

Notification sent by Starline Adventures Website Backend.
`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(emailSubject)}</title>
  <style>
    body { margin: 0; padding: 24px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; }
    .email-wrapper { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .email-header { background: #14213d; padding: 28px 24px; text-align: center; border-bottom: 4px solid #F47621; }
    .email-header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 1.5px; }
    .email-header p { margin: 6px 0 0; color: #F47621; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
    .badge-bar { text-align: center; margin-top: -14px; }
    .type-badge { display: inline-block; background: #F47621; color: #ffffff; font-size: 12px; font-weight: 800; padding: 6px 18px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 2px 8px rgba(244,118,33,0.35); }
    .email-body { padding: 32px 28px 24px; }
    .section-title { font-size: 13px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .info-table tr { border-bottom: 1px solid #f1f5f9; }
    .info-table td { padding: 10px 6px; font-size: 14px; vertical-align: top; }
    .info-label { width: 140px; font-weight: 600; color: #64748b; }
    .info-value { color: #0f172a; font-weight: 500; }
    .highlight-value { color: #F47621; font-weight: 700; font-size: 15px; }
    .message-container { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #F47621; border-radius: 6px; padding: 16px 18px; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
    .action-row { margin-top: 28px; padding-top: 20px; border-top: 1px dashed #cbd5e1; text-align: center; }
    .action-btn { display: inline-block; padding: 11px 22px; margin: 4px 6px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .btn-reply { background: #14213d; color: #ffffff !important; }
    .btn-whatsapp { background: #25D366; color: #ffffff !important; }
    .btn-call { background: #0284c7; color: #ffffff !important; }
    .email-footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <h1>STARLINE ADVENTURES</h1>
      <p>Adventure Equipment &amp; Installation Specialist</p>
    </div>

    <div class="badge-bar">
      <span class="type-badge">${escapeHtml(formLabel)}</span>
    </div>

    <div class="email-body">
      <div class="section-title">Customer Information</div>
      <table class="info-table">
        <tr>
          <td class="info-label">Full Name:</td>
          <td class="info-value"><strong>${escapeHtml(record.name)}</strong></td>
        </tr>
        <tr>
          <td class="info-label">Email:</td>
          <td class="info-value"><a href="mailto:${escapeHtml(record.email)}" style="color:#0284c7; text-decoration:none; font-weight:600;">${escapeHtml(record.email)}</a></td>
        </tr>
        <tr>
          <td class="info-label">Phone:</td>
          <td class="info-value"><a href="tel:${escapeHtml(cleanPhone)}" style="color:#0f172a; text-decoration:none; font-weight:600;">${escapeHtml(record.phone)}</a></td>
        </tr>
        <tr>
          <td class="info-label">Company / Org:</td>
          <td class="info-value">${escapeHtml(record.company || 'N/A')}</td>
        </tr>
        <tr>
          <td class="info-label">Location:</td>
          <td class="info-value">${escapeHtml(record.location)}</td>
        </tr>
      </table>

      <div class="section-title">Project Interest</div>
      <table class="info-table">
        <tr>
          <td class="info-label">Product / Activity:</td>
          <td class="info-value highlight-value">${escapeHtml(record.product)}</td>
        </tr>
        <tr>
          <td class="info-label">Submission Date:</td>
          <td class="info-value">${escapeHtml(formattedDate)} (IST)</td>
        </tr>
        <tr>
          <td class="info-label">Reference ID:</td>
          <td class="info-value"><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:12px;">${escapeHtml(record.id)}</code></td>
        </tr>
      </table>

      <div class="section-title">Project Details &amp; Message</div>
      <div class="message-container">${escapeHtml(record.message || 'No additional message provided.')}</div>

      <div class="action-row">
        <a class="action-btn btn-reply" href="mailto:${escapeHtml(record.email)}?subject=Re:%20Starline%20Adventures%20-%20${encodeURIComponent(record.product)}">✉️ Reply to Customer</a>
        ${cleanPhone ? `<a class="action-btn btn-whatsapp" href="https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hello ${record.name}, thank you for reaching out to Starline Adventures regarding your project for ${record.product}.`)}" target="_blank">💬 Chat on WhatsApp</a>` : ''}
        ${cleanPhone ? `<a class="action-btn btn-call" href="tel:${cleanPhone}">📞 Call Customer</a>` : ''}
      </div>
    </div>

    <div class="email-footer">
      This is an automated notification from the Starline Adventures website backend.<br>
      Recipient: <strong>${escapeHtml(targetRecipient)}</strong>
    </div>
  </div>
</body>
</html>
`;

  const mailOptions = {
    from: `"Starline Adventures Web" <${emailUser}>`,
    to: targetRecipient,
    replyTo: record.email,
    subject: emailSubject,
    text: plainText,
    html: htmlBody
  };

  const info = await transporter.sendMail(mailOptions);
  return {
    sent: true,
    messageId: info.messageId,
    recipient: targetRecipient
  };
}

async function sendCustomerConfirmationEmail(record) {
  const emailUser = process.env.EMAIL_USER || 'starlineadventure@gmail.com';
  const emailAppPassword = process.env.EMAIL_APP_PASSWORD;

  if (!emailAppPassword || !record.email || !record.email.includes('@')) {
    return { sent: false };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailAppPassword.replace(/\s+/g, '')
    }
  });

  const subject = `Enquiry Confirmation [${record.id}] - Starline Adventures`;
  const textBody = `Hello ${record.name},

Thank you for choosing Starline Adventures! We have successfully received your enquiry. Our team will review your requirements and get in touch with you shortly. We appreciate your interest and look forward to working with you.

------------------------------------------------------------
ENQUIRY SUMMARY:
- Enquiry ID:        ${record.id}
- Interested In:     ${record.product}
- Project Location:  ${record.location}
- Date Received:     ${new Date(record.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
------------------------------------------------------------

For immediate assistance, you can also reach us via:
Phone: +91-94249-04000 / +91-9421-244-244
WhatsApp: https://wa.me/919424904000
Email: starlineadventure@gmail.com

Warm regards,
Starline Adventures Pvt Ltd
Opposite Government Guest House, Nagpur – 441302
https://starlineadventures.com
`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .header { background: #14213d; padding: 24px; text-align: center; border-bottom: 4px solid #F47621; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 1px; }
    .header p { color: #F47621; margin: 4px 0 0; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .msg-box { background: rgba(244, 118, 33, 0.06); border-left: 4px solid #F47621; padding: 14px 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px; }
    .id-badge { display: inline-block; background: #14213d; color: #ffffff; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 6px; margin-bottom: 16px; }
    .summary-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    .summary-table td { padding: 8px 4px; border-bottom: 1px solid #f1f5f9; }
    .summary-label { color: #64748b; font-weight: 600; width: 130px; }
    .summary-val { color: #0f172a; font-weight: 600; }
    .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>STARLINE ADVENTURES</h1>
      <p>Adventure Park Manufacturing &amp; Installation</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${escapeHtml(record.name)},</div>
      <div class="msg-box">
        Thank you for choosing Starline Adventures! We have successfully received your enquiry. Our team will review your requirements and get in touch with you shortly. We appreciate your interest and look forward to working with you.
      </div>
      <div>
        <span class="id-badge">Enquiry Reference: ${escapeHtml(record.id)}</span>
      </div>
      <table class="summary-table">
        <tr><td class="summary-label">Selected Solution:</td><td class="summary-val">${escapeHtml(record.product)}</td></tr>
        <tr><td class="summary-label">Project Location:</td><td class="summary-val">${escapeHtml(record.location)}</td></tr>
        <tr><td class="summary-label">Contact Phone:</td><td class="summary-val">${escapeHtml(record.phone)}</td></tr>
      </table>
    </div>
    <div class="footer">
      Starline Adventures Pvt Ltd &bull; Nagpur – 441302 &bull; +91-94249-04000
    </div>
  </div>
</body>
</html>
`;

  return transporter.sendMail({
    from: `"Starline Adventures" <${emailUser}>`,
    to: record.email,
    subject,
    text: textBody,
    html: htmlBody
  });
}

// ============================================================
// 9. INPUT VALIDATION & ENQUIRY PROCESSING
// ============================================================
function validateEnquiryPayload(body, defaultFormType = 'Contact Form') {
  let { name, email, phone, company, location, product, message, formType } = body || {};

  name = sanitizeInput(name);
  email = String(email || '').trim().toLowerCase();
  phone = sanitizeInput(phone);
  company = company ? sanitizeInput(company) : 'N/A';
  location = sanitizeInput(location);
  product = sanitizeInput(product) || 'General Adventure Project Enquiry';
  message = sanitizeInput(message);
  const type = sanitizeInput(formType || defaultFormType);

  // Name validation
  if (!name || name.length < 2 || name.length > 100) {
    return { valid: false, error: 'Please enter a valid full name (2 to 100 characters).' };
  }
  if (/[\r\n\t\0]/.test(name)) {
    return { valid: false, error: 'Invalid characters in name.' };
  }

  // Email validation: RFC standard regex, length boundaries, prevent header injection
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!email || email.length < 5 || email.length > 120 || !emailRegex.test(email) || /[\r\n]/.test(email)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  // Phone validation: min 8 digits, allow +, space, hyphen
  const phoneDigits = phone.replace(/[^\d]/g, '');
  if (!phone || phoneDigits.length < 8 || phoneDigits.length > 20 || phone.length > 30 || !/^\+?[0-9\s\-()]{8,30}$/.test(phone)) {
    return { valid: false, error: 'Please enter a valid phone number (minimum 8 digits).' };
  }

  // Location validation
  if (!location || location.length < 2 || location.length > 120) {
    return { valid: false, error: 'Please enter your project location (city, state).' };
  }

  if (company.length > 120) company = company.slice(0, 120);
  if (product.length > 120) product = product.slice(0, 120);

  if (!message) {
    message = `Project quote request for ${product} at ${location}.`;
  }
  if (message.length > 2000) message = message.slice(0, 2000);

  return {
    valid: true,
    data: {
      name,
      email,
      phone,
      company,
      location,
      product,
      message,
      formType: type.slice(0, 64)
    }
  };
}

async function handleSubmission(req, res, defaultFormType = 'Contact Form') {
  const standardSuccessMsg = "Thank you for choosing Starline Adventures. We have received your enquiry and our team will get in touch with you shortly.";

  try {
    // 1. Honeypot anti-spam check
    const hp = req.body.website_hp || req.body.hp_field || req.body.confirm_email;
    if (hp) {
      console.warn(`[Spam Blocked]: Honeypot triggered`);
      return res.json({
        ok: true,
        enquiryId: `SA-ENQ-${Math.floor(100000 + Math.random() * 900000)}`,
        message: standardSuccessMsg,
        customerMessage: standardSuccessMsg
      });
    }

    // 2. Rate Limiting Check
    const clientIp = getClientIp(req);
    if (!checkEnquiryRateLimit(clientIp)) {
      console.warn(`[Rate Limit Exceeded]: Too many enquiry submissions from client`);
      return res.status(429).json({
        ok: false,
        error: 'Too many enquiry submissions from your connection. Please wait a few minutes before submitting again.'
      });
    }

    // 3. Server-side Input Validation
    const validation = validateEnquiryPayload(req.body, defaultFormType);
    if (!validation.valid) {
      return res.status(400).json({ ok: false, error: validation.error });
    }

    const { name, email, phone, company, location, product, message, formType } = validation.data;

    // 4. Duplicate Submission Protection
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const fingerprint = `${email}|${cleanPhone}|${message.slice(0, 50).toLowerCase()}`;
    const duplicateEnquiryId = checkDuplicateSubmission(fingerprint);

    if (duplicateEnquiryId) {
      console.log(`[Duplicate Submission Prevented]: Returning existing ID [${duplicateEnquiryId}]`);
      return res.json({
        ok: true,
        id: duplicateEnquiryId,
        enquiryId: duplicateEnquiryId,
        message: standardSuccessMsg,
        customerMessage: standardSuccessMsg
      });
    }

    // 5. Generate Unique Enquiry ID & Record
    const uniqueNumber = Math.floor(100000 + Math.random() * 900000);
    const enquiryId = `SA-ENQ-${uniqueNumber}`;

    const enquiryRecord = {
      id: enquiryId,
      formType,
      name,
      email,
      phone,
      company,
      location,
      product,
      message,
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    // 6. Save Permanently in Firestore
    if (db) {
      try {
        const docRef = doc(db, 'enquiries', enquiryId);
        await setDoc(docRef, enquiryRecord);
        console.log(`[Firestore Success]: Persisted enquiry [${enquiryId}]`);
        recordSubmissionFingerprint(fingerprint, enquiryId);
      } catch (fsErr) {
        console.warn(`[Firestore Notice]: Persistence note for [${enquiryId}]:`, fsErr.message);
      }
    }

    // Also persist in server-side secure store
    saveEnquirySecurely(enquiryRecord);

    // 7. Dispatch Notification Email
    let emailSent = false;
    try {
      const emailStatus = await sendNotificationEmail(enquiryRecord);
      emailSent = emailStatus.sent;
      if (emailSent) {
        console.log(`[Email Sent]: Dispatched ${formType} notification for [${enquiryId}]`);
      }
    } catch (mailError) {
      const appPass = process.env.EMAIL_APP_PASSWORD || '';
      const safeErrMsg = mailError && mailError.message
        ? (appPass ? mailError.message.replace(new RegExp(appPass, 'g'), '***') : mailError.message)
        : 'Mail error';
      console.error(`[Email Error]: Non-fatal notification error for [${enquiryId}]:`, safeErrMsg);
    }

    // Dispatch Customer Confirmation Email (Asynchronous, non-blocking)
    sendCustomerConfirmationEmail(enquiryRecord).catch(custMailErr => {
      const appPass = process.env.EMAIL_APP_PASSWORD || '';
      const safeErrMsg = custMailErr && custMailErr.message
        ? (appPass ? custMailErr.message.replace(new RegExp(appPass, 'g'), '***') : custMailErr.message)
        : 'Customer confirmation error';
      console.warn(`[Customer Mail Warning]: Confirmation notice for [${enquiryId}]:`, safeErrMsg);
    });

    // Support standard browser form redirection
    if (req.headers.accept && req.headers.accept.includes('text/html') && !req.xhr) {
      return res.redirect('/thank-you.html');
    }

    return res.json({
      ok: true,
      id: enquiryId,
      enquiryId: enquiryId,
      message: standardSuccessMsg,
      customerMessage: standardSuccessMsg,
      emailSent
    });
  } catch (err) {
    console.error('Error processing enquiry:', err && err.message ? err.message : 'Unknown');
    return res.status(500).json({ ok: false, error: 'Internal server error while processing your enquiry.' });
  }
}

// ============================================================
// 10. ADMIN AUTHENTICATION MIDDLEWARE
// Strict constant-time secret verification without source-code defaults
// ============================================================
function requireAdminAuth(req, res, next) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || typeof adminSecret !== 'string' || adminSecret.trim() === '') {
    return res.status(503).json({
      ok: false,
      error: 'Admin service authentication is not configured on this server.'
    });
  }

  const authHeader = req.headers['authorization'] || '';
  const customHeader = req.headers['x-admin-secret'] || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (typeof customHeader === 'string' ? customHeader.trim() : '');

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthorized access. Admin authorization required.'
    });
  }

  const tokenBuf = Buffer.from(token);
  const secretBuf = Buffer.from(adminSecret.trim());

  if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
    return res.status(401).json({
      ok: false,
      error: 'Invalid admin credentials.'
    });
  }

  return next();
}

// ============================================================
// 11. PUBLIC & ADMIN API ENDPOINTS
// ============================================================

// Ensure all API endpoints are dynamic and never cached by client or proxy
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Public Health Check Endpoint (sanitized, no credentials or internals exposed)
app.get('/api/health', (req, res) => {
  const clientIp = getClientIp(req);
  if (!checkApiRateLimit(clientIp)) {
    return res.status(429).json({ ok: false, error: 'Rate limit exceeded' });
  }

  res.json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

// Firebase client config endpoint (public web keys only)
app.get('/api/firebase-config', (req, res) => {
  const clientIp = getClientIp(req);
  if (!checkApiRateLimit(clientIp)) {
    return res.status(429).json({ ok: false, error: 'Rate limit exceeded' });
  }

  if (!firebaseConfig) {
    return res.status(503).json({ ok: false, error: 'Firebase service unavailable' });
  }

  // Expose ONLY browser-intended public keys
  res.json({
    ok: true,
    config: {
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId,
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      oAuthClientId: firebaseConfig.oAuthClientId
    }
  });
});

// Protected Admin SMTP diagnostics
app.get('/api/email-status', requireAdminAuth, async (req, res) => {
  const emailUser = process.env.EMAIL_USER || 'starlineadventure@gmail.com';
  const hasPassword = Boolean(process.env.EMAIL_APP_PASSWORD);

  if (!hasPassword) {
    return res.json({
      configured: false,
      user: emailUser,
      message: 'EMAIL_APP_PASSWORD is not set in environment.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, '')
      }
    });

    await transporter.verify();
    return res.json({
      configured: true,
      verified: true,
      user: emailUser,
      message: 'Gmail SMTP connection verified successfully.'
    });
  } catch (err) {
    return res.status(500).json({
      configured: true,
      verified: false,
      user: emailUser,
      error: 'SMTP connection verification failed.'
    });
  }
});

// Protected Admin Enquiry Retrieval Endpoints
app.get('/api/enquiry', requireAdminAuth, async (req, res) => {
  try {
    const stored = getStoredEnquiries();
    if (stored.length > 0) {
      return res.json({ ok: true, count: stored.length, enquiries: stored });
    }

    if (db) {
      const querySnapshot = await getDocs(collection(db, 'enquiries'));
      const records = [];
      querySnapshot.forEach(docSnap => records.push(docSnap.data()));
      return res.json({ ok: true, count: records.length, enquiries: records });
    }

    res.json({ ok: true, count: 0, enquiries: [] });
  } catch (err) {
    console.warn('[Admin API Note]: Retrieval note:', err.message);
    const stored = getStoredEnquiries();
    res.json({ ok: true, count: stored.length, enquiries: stored });
  }
});

app.get('/api/enquiries-firestore', requireAdminAuth, async (req, res) => {
  try {
    const stored = getStoredEnquiries();
    return res.json({ ok: true, count: stored.length, enquiries: stored });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to retrieve enquiries.' });
  }
});

// Public Submission Endpoints
app.post('/api/enquiry', (req, res) => handleSubmission(req, res, 'Contact Form'));
app.post('/api/rfq', (req, res) => handleSubmission(req, res, 'Quick RFQ'));
app.post('/api/quote', (req, res) => handleSubmission(req, res, 'Quick RFQ'));

// Dynamic Gallery Images Endpoint - reads authentic verified gallery images from centralized image system
app.get('/api/gallery-images', (req, res) => {
  const clientIp = getClientIp(req);
  if (!checkApiRateLimit(clientIp)) {
    return res.status(429).json({ ok: false, error: 'Rate limit exceeded' });
  }

  try {
    const verifiedImages = StarlineImageMap.getVerifiedGalleryData();
    res.json({
      ok: true,
      count: verifiedImages.length,
      images: verifiedImages
    });
  } catch (err) {
    console.error('[Gallery API Error]:', err && err.message ? err.message : 'Unknown');
    res.status(500).json({ ok: false, error: 'Failed to load gallery images' });
  }
});

// Helper for generating dynamic adventure ride SVGs when image file is missing
function generateRideSvg(imageName) {
  const cleanName = path.parse(imageName).name.replace(/_/g, ' ');
  const title = cleanName
    .replace('square', '')
    .replace(/\d+$/, '')
    .trim();
  const displayTitle = title ? title.charAt(0).toUpperCase() + title.slice(1) : 'Adventure Ride';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#14213d"/>
        <stop offset="60%" stop-color="#1f3152"/>
        <stop offset="100%" stop-color="#0b1329"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff8c42"/>
        <stop offset="100%" stop-color="#F47621"/>
      </linearGradient>
    </defs>
    <rect width="600" height="600" fill="url(#bg)"/>
    <circle cx="300" cy="250" r="160" fill="none" stroke="#2a4365" stroke-width="3" stroke-dasharray="8 8" opacity="0.6"/>
    <path d="M120,440 L300,160 L480,440 Z" fill="none" stroke="url(#accent)" stroke-width="6" stroke-linejoin="round"/>
    <line x1="80" y1="260" x2="520" y2="340" stroke="#f4f4f4" stroke-width="4" stroke-linecap="round"/>
    <circle cx="300" cy="295" r="16" fill="url(#accent)"/>
    <line x1="300" y1="295" x2="300" y2="360" stroke="#fff" stroke-width="3"/>
    <rect x="280" y="360" width="40" height="30" rx="6" fill="#F47621"/>
    <path d="M0,520 Q150,490 300,510 T600,490 L600,600 L0,600 Z" fill="#0f172a"/>
    <path d="M0,545 Q200,530 400,550 T600,535 L600,600 L0,600 Z" fill="#090d16"/>
    <rect x="50" y="470" width="500" height="80" rx="12" fill="#000000" fill-opacity="0.65" stroke="#F47621" stroke-width="2"/>
    <text x="300" y="508" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="24" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">${escapeHtml(displayTitle.toUpperCase())}</text>
    <text x="300" y="534" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="14" fill="#F47621" text-anchor="middle" letter-spacing="2">STARLINE ADVENTURES</text>
  </svg>`;
}

// ============================================================
// 12. STATIC FILE SERVING WITH STRICT DIRECTORY RESTRICTION
// ============================================================

// Static assets: css, js, logos with optimal browser caching
app.use('/css', express.static(path.join(__dirname, 'css'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  dotfiles: 'ignore',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
  }
}));

app.use('/js', express.static(path.join(__dirname, 'js'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  dotfiles: 'ignore',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
  }
}));

app.use('/logos', express.static(path.join(__dirname, 'images', 'logos'), {
  maxAge: '30d',
  etag: true,
  lastModified: true,
  dotfiles: 'ignore',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  }
}));

app.use('/logos', express.static(path.join(__dirname, 'logos'), {
  maxAge: '30d',
  etag: true,
  lastModified: true,
  dotfiles: 'ignore',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  }
}));

// Images with WebP content negotiation and 30-day immutable caching
const safeImagesRoot = path.resolve(__dirname, 'images');

function serveImageWithWebpNegotiation(req, res, next) {
  const relativeSubpath = req.path || '';
  const decodedSubpath = decodeURIComponent(relativeSubpath);
  const directPath = path.resolve(safeImagesRoot, '.' + decodedSubpath);

  if (!directPath.startsWith(safeImagesRoot)) {
    return res.status(403).json({ ok: false, error: 'Access forbidden.' });
  }

  const acceptsWebp = req.headers.accept && req.headers.accept.includes('image/webp');
  res.setHeader('Vary', 'Accept');

  // If client accepts WebP and requesting JPG/PNG, check if .webp sibling exists
  if (acceptsWebp && /\.(png|jpe?g)$/i.test(directPath)) {
    const webpPath = directPath.replace(/\.(png|jpe?g)$/i, '.webp');
    if (fs.existsSync(webpPath)) {
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      return res.sendFile(webpPath);
    }
  }

  if (fs.existsSync(directPath)) {
    try {
      const stat = fs.statSync(directPath);
      if (stat.isFile()) {
        res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
        return res.sendFile(directPath);
      }
    } catch (e) {}
  }

  next();
}

app.use('/images', serveImageWithWebpNegotiation);
app.use('/image', serveImageWithWebpNegotiation);

app.use('/images', express.static(safeImagesRoot, {
  maxAge: '30d',
  etag: true,
  lastModified: true,
  dotfiles: 'ignore',
  fallthrough: true
}));

app.use('/image', express.static(safeImagesRoot, {
  maxAge: '30d',
  etag: true,
  lastModified: true,
  dotfiles: 'ignore',
  fallthrough: true
}));

// Fallback for missing ride images with strict traversal prevention
app.get('/images/*', (req, res) => {
  const relativeSubpath = req.params[0] || '';
  const directPath = path.resolve(safeImagesRoot, relativeSubpath);

  // Strictly verify path is inside safe images directory
  if (!directPath.startsWith(safeImagesRoot + path.sep) && directPath !== safeImagesRoot) {
    return res.status(403).json({ ok: false, error: 'Access forbidden.' });
  }

  if (fs.existsSync(directPath)) {
    try {
      const stat = fs.statSync(directPath);
      if (stat.isFile()) {
        return res.sendFile(directPath);
      }
    } catch (e) {}
  }

  const baseName = path.basename(relativeSubpath);
  if (!baseName || baseName.includes('..') || baseName.includes('/') || baseName.includes('\\')) {
    return res.status(400).json({ ok: false, error: 'Invalid file parameter' });
  }

  // Case-insensitive file search strictly within images folder
  const findFileCaseInsensitive = (dir, target) => {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.resolve(dir, file);
        if (!fullPath.startsWith(safeImagesRoot)) continue;
        if (fs.statSync(fullPath).isDirectory()) {
          const sub = findFileCaseInsensitive(fullPath, target);
          if (sub) return sub;
        } else if (file.toLowerCase() === target.toLowerCase()) {
          return fullPath;
        }
      }
    } catch (e) {}
    return null;
  };

  const matchedFile = findFileCaseInsensitive(safeImagesRoot, baseName);
  if (matchedFile && fs.existsSync(matchedFile)) {
    return res.sendFile(matchedFile);
  }

  // Return safe vector fallback
  const svg = generateRideSvg(baseName);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(svg);
});

// Whitelist of legitimate website HTML pages
const ALLOWED_PAGES = new Set([
  'index',
  'about',
  'contact',
  'gallery',
  'portfolio',
  'product-details',
  'products',
  'project-details',
  'team',
  'testimonials',
  'thank-you'
]);

// SEO endpoints
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// Root landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// HTML page routing with validation
app.get('/:page', (req, res, next) => {
  let pageName = req.params.page;
  if (pageName.endsWith('.html')) {
    pageName = pageName.slice(0, -5);
  }

  // Only allow alphanumeric characters, underscores, hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(pageName)) {
    return next();
  }

  if (ALLOWED_PAGES.has(pageName.toLowerCase())) {
    const filePath = path.resolve(__dirname, pageName.toLowerCase() + '.html');
    if (filePath.startsWith(__dirname + path.sep) && fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }

  next();
});

// Root images / favicon fallback
app.get('/working.png', (req, res) => {
  const p = path.join(__dirname, 'working.png');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.status(404).send('Not Found');
});

// 404 handler for unmapped routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================
// 13. GLOBAL ERROR HANDLER
// Never exposes stack traces or internal server paths
// ============================================================
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err && err.message ? err.message : 'Unknown server error');
  if (res.headersSent) {
    return next(err);
  }
  return res.status(500).json({
    ok: false,
    error: 'An unexpected server error occurred. Please try again later.'
  });
});

// Start HTTP server on port 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Starline Adventures secured server running on http://0.0.0.0:${PORT} in [${NODE_ENV}] mode`);
});
