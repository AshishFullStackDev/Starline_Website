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
    normalized.includes('.google.com') ||
    normalized.includes('googleusercontent.com') ||
    normalized.includes('localhost') ||
    normalized.includes('127.0.0.1');

  if (isDevOrPreview && (
    normalized.includes('.run.app') ||
    normalized.includes('.google.com') ||
    normalized.includes('googleusercontent.com') ||
    normalized.includes('localhost') ||
    normalized.includes('127.0.0.1')
  )) {
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
// Helper to safely get and sanitize email credentials
function getEmailCredentials() {
  let user = (process.env.EMAIL_USER || '').trim();
  let pass = (process.env.EMAIL_APP_PASSWORD || '').trim();

  // Auto-correct if user accidentally swapped EMAIL_USER and EMAIL_APP_PASSWORD
  if (pass.includes('@') && !user.includes('@')) {
    const temp = user;
    user = pass;
    pass = temp;
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

async function sendNotificationEmail(record) {
  const { user: emailUser, pass: emailAppPassword, hasPassword, targetRecipient } = getEmailCredentials();

  if (!hasPassword) {
    console.warn(`[Gmail SMTP Notice]: EMAIL_APP_PASSWORD not configured. Enquiry [${record.id}] saved to database and local store, email skipped.`);
    return { sent: false, reason: 'EMAIL_APP_PASSWORD not configured. Generate a 16-character Google App Password for starlineadventure@gmail.com to enable direct email delivery.' };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailAppPassword
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  const emailSubject = `NEW WEBSITE ENQUIRY - ${record.product} - ${record.name}`;
  const formLabel = record.formType || 'Website Enquiry';
  const cleanPhone = (record.phone || '').replace(/[^\d+]/g, '');
  const formattedDate = new Date(record.createdAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const plainText = `
STARLINE ADVENTURE
New Website Enquiry

Enquiry ID: ${record.id}
Date & Time: ${formattedDate} (IST)

Customer Name: ${record.name}
Phone: ${record.phone}
Email: ${record.email}
Project Location: ${record.location}
Company / Org: ${record.company || 'N/A'}

Product / Activity: ${record.product}
Form Source: ${record.formType}

Project Requirements:
${record.message || 'No additional message provided.'}

Page URL: ${record.pageUrl || 'Direct'}
Referrer: ${record.referrer || 'Direct'}

------------------------------------------------------------
To reply to customer:
Phone/WhatsApp: ${record.phone}
Email: ${record.email}
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
  const { user: emailUser, pass: emailAppPassword, hasPassword } = getEmailCredentials();

  if (!hasPassword || !record.email || !record.email.includes('@')) {
    return { sent: false };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailAppPassword
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
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

// Helper to detect product name internally from referer URL
function detectProductFromUrl(url) {
  if (!url) return 'General Adventure Project Quote';
  const clean = String(url).toLowerCase();
  if (clean.includes('zipline') || clean.includes('zip-line')) return 'Zip Line';
  if (clean.includes('giant-swing')) return 'Giant Swing';
  if (clean.includes('suspension-bridge')) return 'Suspension Bridge';
  if (clean.includes('climbing-wall-equipment')) return 'Climbing Wall Equipment';
  if (clean.includes('climbing-wall')) return 'Climbing Wall';
  if (clean.includes('sky-cycling')) return 'Sky Cycling';
  if (clean.includes('trampoline-park')) return 'Trampoline Park';
  if (clean.includes('bungee-jumping')) return '4 in 1 Bungee Jumping';
  if (clean.includes('human-gyro')) return 'Human Gyro Ride';
  if (clean.includes('rocket-ejection')) return 'Rocket Ejection';
  if (clean.includes('sky-roller')) return 'Sky Roller Ride';
  if (clean.includes('net-climbing')) return 'Net Climbing';
  if (clean.includes('rope-course-equipment')) return 'Rope Course Equipment';
  if (clean.includes('rope-course-platforms')) return 'Rope Course Platforms & Obstacles';
  if (clean.includes('rope-course')) return 'Rope Course';
  if (clean.includes('multi-activity-tower')) return 'Multi Activity Tower';
  if (clean.includes('glass-bridge')) return 'Glass Bridge';
  if (clean.includes('360-degree-cycle')) return '360 Degree Cycle';
  if (clean.includes('mechanical-bull')) return 'Mechanical Bull Ride';
  if (clean.includes('rifle-shooting')) return 'Rifle Shooting Range';
  if (clean.includes('archery-range')) return 'Archery Range';
  if (clean.includes('open-gym')) return 'Open Gym Equipment';
  if (clean.includes('safety-nets')) return 'Safety Nets';
  if (clean.includes('safety-harness')) return 'Safety Harness & Belts';
  if (clean.includes('safety-helmets')) return 'Safety Helmets & Fall-Arrest Systems';
  if (clean.includes('steel-cables')) return 'Steel Cables, Anchors & Rigging Equipment';
  if (clean.includes('cargo-nets')) return 'Cargo Nets & Net Bridges';
  if (clean.includes('tyre-balance')) return 'Tyre Balance Obstacles';
  if (clean.includes('climbing-holds')) return 'Climbing Holds & Wall Panels';
  if (clean.includes('climbing-ropes')) return 'Climbing Ropes & Carabiners';
  if (clean.includes('adventure-park-platforms')) return 'Adventure Park Platforms';
  if (clean.includes('adventure-park-ladders')) return 'Adventure Park Ladders & Bridges';
  return 'General Adventure Project Quote';
}

// ============================================================
// 9. INPUT VALIDATION & ENQUIRY PROCESSING
// ============================================================
function validateEnquiryPayload(body, defaultFormType = 'Contact Form', referer = '') {
  let { name, email, phone, company, location, product, message, formType } = body || {};

  name = sanitizeInput(name);
  email = String(email || '').trim().toLowerCase();
  phone = sanitizeInput(phone);
  message = sanitizeInput(message);

  // Optional/internal fields - never mandatory for the user
  company = company ? sanitizeInput(company) : 'N/A';
  location = location ? sanitizeInput(location) : 'Not specified';
  product = (product && sanitizeInput(product)) || detectProductFromUrl(referer || body?.pageUrl) || 'General Adventure Project Quote';
  const type = sanitizeInput(formType || defaultFormType);

  // 1. Name validation (Mandatory)
  if (!name || name.length < 2 || name.length > 100) {
    return { valid: false, error: 'Please enter a valid full name (2 to 100 characters).' };
  }
  if (/[\r\n\t\0]/.test(name)) {
    return { valid: false, error: 'Invalid characters in name.' };
  }

  // 2. Email validation (Mandatory)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!email || email.length < 5 || email.length > 120 || !emailRegex.test(email) || /[\r\n]/.test(email)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  // 3. Phone validation (Mandatory)
  const phoneDigits = phone.replace(/[^\d]/g, '');
  if (!phone || phoneDigits.length < 8 || phoneDigits.length > 20 || phone.length > 30 || !/^\+?[0-9\s\-()]{8,30}$/.test(phone)) {
    return { valid: false, error: 'Please enter a valid phone number (minimum 8 digits).' };
  }

  // 4. Message validation (Mandatory)
  if (!message || message.length < 2) {
    return { valid: false, error: 'Please enter your message or project requirements.' };
  }
  if (message.length > 2000) message = message.slice(0, 2000);

  if (company.length > 120) company = company.slice(0, 120);
  if (location.length > 120) location = location.slice(0, 120);
  if (product.length > 120) product = product.slice(0, 120);

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
    const validation = validateEnquiryPayload(req.body, defaultFormType, req.headers.referer);
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

    const fullRecord = {
      ...enquiryRecord,
      pageUrl: sanitizeInput(req.body.pageUrl || req.headers.referer || 'Website Direct'),
      referrer: sanitizeInput(req.body.referrer || req.headers.referer || 'Direct')
    };

    // 6. Save Permanently in Firestore
    if (db) {
      try {
        const docRef = doc(db, 'enquiries', enquiryId);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore operation timeout')), 4000)
        );
        await Promise.race([setDoc(docRef, enquiryRecord), timeoutPromise]);
        console.log(`[Firestore Success]: Persisted enquiry [${enquiryId}]`);
        recordSubmissionFingerprint(fingerprint, enquiryId);
      } catch (fsErr) {
        console.warn(`[Firestore Notice]: Persistence note for [${enquiryId}]:`, fsErr.message);
      }
    }

    // Also persist in server-side secure store
    saveEnquirySecurely(fullRecord);

    // 7. Dispatch Notification Email
    let emailSent = false;
    try {
      const emailStatus = await sendNotificationEmail(fullRecord);
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

    // Support standard browser form redirection (only for classic HTML form POSTs, not JSON API fetches)
    if (!req.is('json') && req.headers.accept && req.headers.accept.includes('text/html') && !req.xhr) {
      return res.redirect(303, '/thank-you.html');
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
  const adminSecret = process.env.ADMIN_SECRET || 'starline-admin-2026';

  const authHeader = req.headers['authorization'] || '';
  const customHeader = req.headers['x-admin-secret'] || '';
  const querySecret = (req.query && typeof req.query.secret === 'string') ? req.query.secret.trim() : '';

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (typeof customHeader === 'string' && customHeader.trim() !== ''
        ? customHeader.trim()
        : querySecret);

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthorized access. Provide admin secret via query (?secret=...), Authorization Bearer header, or X-Admin-Secret header.'
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
  const { user: emailUser, pass: emailAppPassword, hasPassword, targetRecipient } = getEmailCredentials();

  if (!hasPassword) {
    return res.json({
      configured: false,
      verified: false,
      user: emailUser,
      targetRecipient,
      message: 'EMAIL_APP_PASSWORD is not set in environment or .env. Enquiries are safely saved to Firestore & local storage, but email dispatch requires a 16-character Google App Password.',
      instructions: [
        '1. Log in to Google Account: starlineadventure@gmail.com',
        '2. Enable 2-Step Verification if not already enabled',
        '3. Visit https://myaccount.google.com/apppasswords',
        '4. Create an App password named "Starline Website"',
        '5. Copy the 16-character generated key into EMAIL_APP_PASSWORD in .env'
      ]
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailAppPassword
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });

    await transporter.verify();
    return res.json({
      configured: true,
      verified: true,
      user: emailUser,
      targetRecipient: 'starlineadventure@gmail.com',
      message: 'Gmail SMTP connection verified successfully! New website enquiries will be emailed directly to starlineadventure@gmail.com.'
    });
  } catch (err) {
    return res.status(500).json({
      configured: true,
      verified: false,
      user: emailUser,
      error: 'Gmail SMTP connection verification failed: ' + (err.message || 'Check your 16-character App Password')
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
  maxAge: 0,
  etag: true,
  lastModified: true,
  dotfiles: 'ignore',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
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
  'products',
  'project-details',
  'team',
  'testimonials',
  'thank-you'
]);

// Map of all legacy clean URLs, aliases, and IDs to the new /product/<slug>.html destination
const OLD_PRODUCT_MAP = {
  'zipline-manufacturer': 'zipline',
  'zipline': 'zipline',
  'zip-line': 'zipline',
  'giant-swing-manufacturer': 'giant-swing',
  'giant-swing': 'giant-swing',
  'suspension-bridge-manufacturer': 'suspension-bridge',
  'suspension-bridge': 'suspension-bridge',
  'climbing-wall-manufacturer': 'climbing-wall',
  'climbing-wall': 'climbing-wall',
  'wall-climbing': 'climbing-wall',
  'sky-cycling-manufacturer': 'sky-cycling',
  'sky-cycling': 'sky-cycling',
  'zip-bike-sky-cycle': 'sky-cycling',
  'sky-cycle': 'sky-cycling',
  'trampoline-park-manufacturer': 'trampoline-park',
  'trampoline': 'trampoline-park',
  'trampoline-park': 'trampoline-park',
  'bungee-jumping-setup-manufacturer': 'bungee-jumping',
  'bungee-jumping': 'bungee-jumping',
  '4-in-1-bungee-jumping': 'bungee-jumping',
  'human-gyro-ride-manufacturer': 'human-gyro-ride',
  'human-gyro-ride': 'human-gyro-ride',
  'human-gyro': 'human-gyro-ride',
  'rocket-ejection-ride-manufacturer': 'rocket-ejection',
  'rocket-ejection': 'rocket-ejection',
  'rocket-ejection-ride': 'rocket-ejection',
  'sky-roller-ride-manufacturer': 'sky-roller-ride',
  'sky-roller': 'sky-roller-ride',
  'sky-roller-ride': 'sky-roller-ride',
  'net-climbing-manufacturer': 'net-climbing',
  'net-climbing': 'net-climbing',
  'rope-course-manufacturer': 'rope-course',
  'rope-course': 'rope-course',
  'ninja-rope-courses': 'rope-course',
  'multi-activity-tower-manufacturer': 'multi-activity-tower',
  'multi-activity-tower': 'multi-activity-tower',
  'tower': 'multi-activity-tower',
  'glass-bridge-manufacturer': 'glass-bridge',
  'glass-bridge': 'glass-bridge',
  '360-degree-cycle-manufacturer': '360-degree-cycle',
  '360-degree-cycle': '360-degree-cycle',
  'mechanical-bull-ride-manufacturer': 'mechanical-bull-ride',
  'mechanical-bull-ride': 'mechanical-bull-ride',
  'bull-ride': 'mechanical-bull-ride',
  'rifle-shooting-range-setup': 'rifle-shooting-range',
  'rifle-shooting': 'rifle-shooting-range',
  'rifle-shooting-range': 'rifle-shooting-range',
  'archery-range-setup': 'archery-range',
  'archery': 'archery-range',
  'archery-range': 'archery-range',
  'open-gym-equipment-manufacturer': 'open-gym-equipment',
  'open-gym-equipment': 'open-gym-equipment',
  'climbing-wall-equipment-manufacturer': 'climbing-wall-equipment',
  'climbing-wall-equipment': 'climbing-wall-equipment',
  'rope-course-equipment-manufacturer': 'rope-course-equipment',
  'rope-course-equipment': 'rope-course-equipment',
  'adventure-safety-nets-manufacturer': 'safety-nets',
  'safety-nets': 'safety-nets',
  'adventure-safety-nets': 'safety-nets',
  'adventure-safety-harness-manufacturer': 'safety-harness-belts',
  'safety-harness-belts': 'safety-harness-belts',
  'adventure-safety-harness': 'safety-harness-belts',
  'zipline-equipment-manufacturer': 'zipline-equipment',
  'zipline-equipment': 'zipline-equipment',
  'climbing-ropes-carabiners-supplier': 'climbing-ropes-carabiners',
  'climbing-ropes-carabiners': 'climbing-ropes-carabiners',
  'climbing-holds-wall-panels-manufacturer': 'climbing-holds-wall-panels',
  'climbing-holds-wall-panels': 'climbing-holds-wall-panels',
  'rope-course-platforms-obstacles-manufacturer': 'rope-course-platforms-obstacles',
  'rope-course-platforms-obstacles': 'rope-course-platforms-obstacles',
  'adventure-park-platforms-manufacturer': 'adventure-park-platforms',
  'adventure-park-platforms': 'adventure-park-platforms',
  'cargo-nets-net-bridges-manufacturer': 'cargo-nets-net-bridges',
  'cargo-nets-net-bridges': 'cargo-nets-net-bridges',
  'tyre-balance-obstacles-manufacturer': 'tyre-balance-obstacles',
  'tyre-balance-obstacles': 'tyre-balance-obstacles',
  'adventure-park-ladders-bridges-manufacturer': 'adventure-park-ladders-bridges',
  'adventure-park-ladders-bridges': 'adventure-park-ladders-bridges',
  'safety-helmets-fall-arrest-systems': 'safety-helmets-fall-arrest-systems',
  'steel-cables-anchors-rigging-equipment': 'steel-cables-anchors-rigging-equipment'
};

// 1. Static serving and routing for /product/:file.html
app.get('/product/:file.html', (req, res, next) => {
  const fileName = (req.params.file || '').toLowerCase().trim();
  const targetSlug = OLD_PRODUCT_MAP[fileName] || fileName;
  if (targetSlug !== fileName) {
    return res.redirect(301, `/product/${targetSlug}.html`);
  }
  const filePath = path.join(__dirname, 'product', `${targetSlug}.html`);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  next();
});

// Redirect /product/:slug or /product/:slug/ to /product/:slug.html
app.get('/product/:slug', (req, res, next) => {
  const raw = (req.params.slug || '').toLowerCase().trim();
  if (raw.endsWith('.html')) return next();
  const targetSlug = OLD_PRODUCT_MAP[raw] || raw;
  const filePath = path.join(__dirname, 'product', `${targetSlug}.html`);
  if (fs.existsSync(filePath)) {
    return res.redirect(301, `/product/${targetSlug}.html`);
  }
  next();
});

app.get('/product/:slug/', (req, res, next) => {
  const raw = (req.params.slug || '').toLowerCase().trim();
  const targetSlug = OLD_PRODUCT_MAP[raw] || raw;
  const filePath = path.join(__dirname, 'product', `${targetSlug}.html`);
  if (fs.existsSync(filePath)) {
    return res.redirect(301, `/product/${targetSlug}.html`);
  }
  next();
});

// 2. 301 Permanent Redirects for legacy product-details URLs
app.get(['/product-details.html', '/product-details'], (req, res) => {
  const productKey = (req.query.product || req.query.id || '').toLowerCase().trim();
  if (productKey && OLD_PRODUCT_MAP[productKey]) {
    return res.redirect(301, `/product/${OLD_PRODUCT_MAP[productKey]}.html`);
  }
  return res.redirect(301, '/products.html');
});

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

// 3. Clean 301 redirects from old directory URLs (e.g. /zipline-manufacturer/ -> /product/zipline.html)
app.get('/:productSlug', (req, res, next) => {
  const rawParam = req.params.productSlug || '';
  const slug = rawParam.toLowerCase().trim();

  if (OLD_PRODUCT_MAP[slug]) {
    return res.redirect(301, `/product/${OLD_PRODUCT_MAP[slug]}.html`);
  }

  next();
});

app.get('/:productSlug/', (req, res, next) => {
  const rawParam = req.params.productSlug || '';
  const slug = rawParam.toLowerCase().trim();

  if (OLD_PRODUCT_MAP[slug]) {
    return res.redirect(301, `/product/${OLD_PRODUCT_MAP[slug]}.html`);
  }

  next();
});

// HTML page routing with validation (supports GET and POST redirects)
app.all('/:page', (req, res, next) => {
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

// Proper 404 handler for unmapped routes
app.use((req, res) => {
  const notFoundPath = path.join(__dirname, '404.html');
  if (fs.existsSync(notFoundPath)) {
    return res.status(404).sendFile(notFoundPath);
  }
  return res.status(404).send('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p><a href="/">Return Home</a></p></body></html>');
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
