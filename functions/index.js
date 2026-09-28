/**
 * Starline Adventures - Firebase Cloud Functions
 * Project: starline-website-f2f87
 * 
 * Automatically sends an email notification to starlineadventure@gmail.com
 * whenever a new enquiry document is created in Firestore:
 * enquiries/{enquiryId}
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

// In-memory set for runtime deduplication in function instance
const processedEnquiryIds = new Set();

/**
 * HTML escaper for safe email rendering
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format timestamp nicely into IST
 */
function formatCreatedAt(createdAt) {
  if (!createdAt) return '';
  try {
    if (typeof createdAt.toDate === 'function') {
      return createdAt.toDate().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    }
    const date = new Date(createdAt);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    }
  } catch (e) {
    // fallback to string
  }
  return String(createdAt);
}

/**
 * Cloud Function Trigger on Firestore enquiry creation
 */
exports.sendEnquiryNotification = onDocumentCreated('enquiries/{enquiryId}', async (event) => {
  const snap = event.data;
  if (!snap) {
    console.log('[Notice]: No document data present in event.');
    return null;
  }

  const data = snap.data() || {};
  const enquiryId = event.params.enquiryId || data.id || snap.id;

  // 1. Prevent duplicate email notifications
  if (data.emailSent === true) {
    console.log(`[Deduplication]: Email already recorded as sent for enquiry [${enquiryId}]. Skipping.`);
    return null;
  }

  if (processedEnquiryIds.has(enquiryId)) {
    console.log(`[Deduplication]: Enquiry [${enquiryId}] already processed in this instance. Skipping.`);
    return null;
  }
  processedEnquiryIds.add(enquiryId);

  // 2. Validate email credentials
  const emailUser = (process.env.EMAIL_USER || 'starlineadventure@gmail.com').trim();
  const rawPass = (process.env.EMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || '').trim();
  const emailAppPassword = rawPass.replace(/\s+/g, '');
  const targetRecipient = 'starlineadventure@gmail.com';

  if (!emailAppPassword) {
    console.error(`[Email Configuration Error]: EMAIL_APP_PASSWORD is not configured. Enquiry [${enquiryId}] remains safely stored in Firestore, but email cannot be sent.`);
    console.error('Please configure EMAIL_APP_PASSWORD in Firebase Cloud Functions environment or secrets.');
    return null;
  }

  // 3. Extract and sanitize fields
  const name = data.name || 'Not provided';
  const email = data.email || 'Not provided';
  const phone = data.phone || 'Not provided';
  const message = data.message || 'No message provided';
  const product = data.product || '';
  const formType = data.formType || '';
  const id = data.id || enquiryId;
  const createdAtFormatted = formatCreatedAt(data.createdAt);

  // 4. Construct Exact Required Email Subject & Body
  const emailSubject = 'New Website Enquiry - Starline Adventures';

  let plainText = `New enquiry received from Starline Adventures website.\n\n`;
  plainText += `Name: ${name}\n`;
  plainText += `Email: ${email}\n`;
  plainText += `Phone: ${phone}\n`;
  plainText += `Message: ${message}\n`;

  if (product) plainText += `\nProduct: ${product}`;
  if (formType) plainText += `\nForm Type: ${formType}`;
  if (id) plainText += `\nEnquiry ID: ${id}`;
  if (createdAtFormatted) plainText += `\nCreated At: ${createdAtFormatted} (IST)`;

  const cleanPhone = String(phone).replace(/[^\d+]/g, '');

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(emailSubject)}</title>
  <style>
    body { margin: 0; padding: 24px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; }
    .email-wrapper { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .email-header { background: #14213d; padding: 28px 24px; text-align: center; border-bottom: 4px solid #F47621; }
    .email-header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 1px; }
    .email-header p { margin: 6px 0 0; color: #F47621; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
    .badge-bar { text-align: center; margin-top: -14px; }
    .type-badge { display: inline-block; background: #F47621; color: #ffffff; font-size: 12px; font-weight: 800; padding: 6px 18px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; }
    .email-body { padding: 32px 28px 24px; }
    .notice { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 20px; padding: 12px 16px; background: #fff7ed; border-left: 4px solid #F47621; border-radius: 4px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .info-table td { padding: 10px 8px; font-size: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .info-label { width: 140px; font-weight: 700; color: #64748b; }
    .info-value { color: #0f172a; }
    .message-container { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #F47621; border-radius: 6px; padding: 16px 18px; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap; word-break: break-word; margin-top: 8px; }
    .action-row { margin-top: 24px; padding-top: 18px; border-top: 1px dashed #cbd5e1; text-align: center; }
    .action-btn { display: inline-block; padding: 10px 20px; margin: 4px 6px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 6px; color: #ffffff !important; }
    .btn-reply { background: #14213d; }
    .btn-whatsapp { background: #25D366; }
    .btn-call { background: #0284c7; }
    .email-footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <h1>STARLINE ADVENTURES</h1>
      <p>New Website Enquiry Notification</p>
    </div>

    ${formType ? `<div class="badge-bar"><span class="type-badge">${escapeHtml(formType)}</span></div>` : ''}

    <div class="email-body">
      <div class="notice">New enquiry received from Starline Adventures website.</div>

      <table class="info-table">
        <tr>
          <td class="info-label">Name:</td>
          <td class="info-value"><strong>${escapeHtml(name)}</strong></td>
        </tr>
        <tr>
          <td class="info-label">Email:</td>
          <td class="info-value"><a href="mailto:${escapeHtml(email)}" style="color:#0284c7; font-weight:600; text-decoration:none;">${escapeHtml(email)}</a></td>
        </tr>
        <tr>
          <td class="info-label">Phone:</td>
          <td class="info-value"><a href="tel:${escapeHtml(cleanPhone)}" style="color:#0f172a; font-weight:600; text-decoration:none;">${escapeHtml(phone)}</a></td>
        </tr>
        ${product ? `<tr><td class="info-label">Product:</td><td class="info-value" style="color:#F47621; font-weight:700;">${escapeHtml(product)}</td></tr>` : ''}
        ${formType ? `<tr><td class="info-label">Form Type:</td><td class="info-value">${escapeHtml(formType)}</td></tr>` : ''}
        ${id ? `<tr><td class="info-label">Enquiry ID:</td><td class="info-value"><code>${escapeHtml(id)}</code></td></tr>` : ''}
        ${createdAtFormatted ? `<tr><td class="info-label">Created At:</td><td class="info-value">${escapeHtml(createdAtFormatted)} (IST)</td></tr>` : ''}
      </table>

      <div style="font-weight:700; color:#64748b; font-size:13px; text-transform:uppercase; margin-top:16px;">Message:</div>
      <div class="message-container">${escapeHtml(message)}</div>

      <div class="action-row">
        <a class="action-btn btn-reply" href="mailto:${escapeHtml(email)}?subject=Re:%20Starline%20Adventures%20Enquiry%20[${encodeURIComponent(id)}]">✉️ Reply to Customer</a>
        ${cleanPhone ? `<a class="action-btn btn-whatsapp" href="https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hello ${name}, thank you for reaching out to Starline Adventures.`)}" target="_blank">💬 WhatsApp</a>` : ''}
        ${cleanPhone ? `<a class="action-btn btn-call" href="tel:${cleanPhone}">📞 Call</a>` : ''}
      </div>
    </div>

    <div class="email-footer">
      Automated notification sent to <strong>${escapeHtml(targetRecipient)}</strong> via Firebase Cloud Functions.
    </div>
  </div>
</body>
</html>
`;

  // 5. Send Email via Gmail SMTP
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

  try {
    const info = await transporter.sendMail({
      from: `"Starline Adventures" <${emailUser}>`,
      to: targetRecipient,
      replyTo: (email && email.includes('@')) ? email : emailUser,
      subject: emailSubject,
      text: plainText,
      html: htmlBody
    });

    console.log(`[Email Sent]: Successfully sent notification for enquiry [${enquiryId}] to ${targetRecipient}. Message ID: ${info.messageId}`);

    // 6. Update Firestore document to record successful email dispatch
    await snap.ref.update({
      emailSent: true,
      emailSentAt: FieldValue.serverTimestamp(),
      emailMessageId: info.messageId || null
    });

    return { success: true, messageId: info.messageId };
  } catch (mailError) {
    // 7. Error handling - Do NOT throw error that breaks Firestore document
    const safeError = mailError && mailError.message ? mailError.message : 'Unknown mail error';
    console.error(`[Email Dispatch Failed]: Could not send notification for enquiry [${enquiryId}]:`, safeError);
    // Enquiry remains safe in Firestore
    return { success: false, error: safeError };
  }
});
