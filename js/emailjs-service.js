/**
 * Starline Adventures - EmailJS Client-Side Integration
 * Sends email notifications directly from the browser to starlineadventure@gmail.com
 * using public credentials (Service ID, Template ID, Public Key).
 *
 * Requirements:
 * - Public configuration only (No passwords, SMTP, or service account secrets)
 * - Required payload: Name, Email, Phone, Message, Product, Enquiry ID
 * - Deduplication: Prevents double sending for the same enquiry ID
 * - Resilient: Failures do not affect Firestore data persistence
 */

(function () {
  'use strict';

  // Sent enquiries set for in-memory & local storage deduplication
  const sentEnquiryIds = new Set();

  // Load previously sent IDs from sessionStorage/localStorage
  try {
    const cached = JSON.parse(sessionStorage.getItem('starline_emailjs_sent') || '[]');
    if (Array.isArray(cached)) {
      cached.forEach(id => sentEnquiryIds.add(id));
    }
  } catch (e) {}

  // EmailJS Configuration Getter
  function getEmailJsConfig() {
    let base = {
      serviceId: 'service_starline',
      templateId: 'template_enquiry',
      publicKey: 'starline_emailjs_public_key',
      recipientEmail: 'starlineadventure@gmail.com'
    };

    if (typeof window !== 'undefined' && window.STARLINE_CONFIG && window.STARLINE_CONFIG.emailjs) {
      base = Object.assign({}, base, window.STARLINE_CONFIG.emailjs);
    }

    if (typeof window !== 'undefined' && window.__EMAILJS_CONFIG__) {
      base = Object.assign({}, base, window.__EMAILJS_CONFIG__);
    }

    return base;
  }

  // Dynamic SDK Loader (Optional enhancement, REST API is also used)
  let sdkLoadPromise = null;
  function loadEmailJsSdk() {
    if (typeof window === 'undefined') return Promise.resolve(null);
    if (window.emailjs) return Promise.resolve(window.emailjs);
    if (sdkLoadPromise) return sdkLoadPromise;

    sdkLoadPromise = new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      script.async = true;
      script.onload = () => {
        const config = getEmailJsConfig();
        if (window.emailjs && config.publicKey) {
          try {
            window.emailjs.init({ publicKey: config.publicKey });
          } catch (e) {}
        }
        resolve(window.emailjs || null);
      };
      script.onerror = () => {
        resolve(null);
      };
      document.head.appendChild(script);
    });

    return sdkLoadPromise;
  }

  function generateRandomAlphanumeric(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(length);
      crypto.getRandomValues(bytes);
      for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    return result;
  }

  function generateEnquiryId(date = new Date()) {
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    const randStr = generateRandomAlphanumeric(6);
    return `ENQ-${dateStr}-${randStr}`;
  }

  /**
   * Dispatch Enquiry Email via EmailJS
   * @param {Object} data - { id, name, email, phone, message, product, company, location, formType }
   * @returns {Promise<{ sent: boolean, messageId?: string, error?: string, duplicate?: boolean }>}
   */
  async function sendEnquiryEmail(data) {
    if (!data || typeof data !== 'object') {
      return { sent: false, error: 'Invalid enquiry payload' };
    }

    const enquiryId = String(data.id || data.enquiryId || '').trim();

    // 1. Duplicate Prevention
    if (enquiryId && sentEnquiryIds.has(enquiryId)) {
      console.log(`[EmailJS]: Enquiry [${enquiryId}] already emailed. Skipping duplicate.`);
      return { sent: false, duplicate: true, message: 'Already sent' };
    }

    const config = getEmailJsConfig();

    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim().toLowerCase();
    const phone = String(data.phone || '').trim();
    const message = String(data.message || '').trim();
    const rawProduct = String(data.product || '').trim();
    const product = (rawProduct && rawProduct !== 'General Adventure Project Enquiry') ? rawProduct : '';

    // 2. Prepare Template Parameters (EmailJS Variables)
    // - name, email, phone, message, enquiry_id, product (only when available)
    // - to_email: starlineadventure@gmail.com
    // - reply_to: {{email}}
    const templateParams = {
      name: name,
      email: email,
      phone: phone,
      message: message,
      enquiry_id: enquiryId || generateEnquiryId(),
      product: product,
      to_email: config.recipientEmail || 'starlineadventure@gmail.com',
      reply_to: email,
      replyTo: email,
      // Compatibility aliases
      from_name: name,
      from_email: email,
      phone_number: phone,
      company: String(data.company || '').trim(),
      location: String(data.location || '').trim(),
      form_type: String(data.formType || 'Website Enquiry').trim(),
      submitted_at: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium'
      })
    };

    console.log(`[EmailJS]: Initiating dispatch for enquiry [${templateParams.enquiry_id}] to ${templateParams.to_email}...`);

    let sentSuccessfully = false;
    let errorDetails = null;

    // 3. Try sending via EmailJS REST API
    try {
      const restPayload = {
        service_id: config.serviceId,
        template_id: config.templateId,
        user_id: config.publicKey,
        template_params: templateParams
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify(restPayload)
      });

      if (response.ok) {
        sentSuccessfully = true;
        console.log(`✅ [EmailJS]: Email successfully dispatched for enquiry [${templateParams.enquiry_id}]!`);
      } else {
        const text = await response.text();
        errorDetails = `HTTP ${response.status}: ${text || response.statusText}`;
        console.warn(`⚠️ [EmailJS Notice]: REST dispatch returned: ${errorDetails}`);
      }
    } catch (restErr) {
      errorDetails = restErr && restErr.message ? restErr.message : 'Network failure';
      console.warn(`⚠️ [EmailJS Network Notice]:`, errorDetails);
    }

    // 4. Fallback attempt via loaded SDK if available and REST didn't succeed
    if (!sentSuccessfully && typeof window !== 'undefined' && window.emailjs && typeof window.emailjs.send === 'function') {
      try {
        const sdkRes = await window.emailjs.send(config.serviceId, config.templateId, templateParams, config.publicKey);
        if (sdkRes && (sdkRes.status === 200 || sdkRes.text === 'OK')) {
          sentSuccessfully = true;
          errorDetails = null;
          console.log(`✅ [EmailJS SDK]: Email successfully dispatched for enquiry [${templateParams.enquiry_id}]!`);
        }
      } catch (sdkErr) {
        if (!errorDetails) {
          errorDetails = sdkErr && sdkErr.text ? sdkErr.text : (sdkErr && sdkErr.message ? sdkErr.message : 'SDK failure');
        }
      }
    }

    // 5. Update deduplication on success
    if (sentSuccessfully && enquiryId) {
      sentEnquiryIds.add(enquiryId);
      try {
        sessionStorage.setItem('starline_emailjs_sent', JSON.stringify(Array.from(sentEnquiryIds).slice(-50)));
      } catch (e) {}
    }

    return {
      sent: sentSuccessfully,
      enquiryId: templateParams.enquiry_id,
      recipient: templateParams.to_email,
      error: sentSuccessfully ? null : (errorDetails || 'Email service unacknowledged')
    };
  }

  // Pre-load SDK in background
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => loadEmailJsSdk().catch(() => {}));
    } else {
      loadEmailJsSdk().catch(() => {});
    }
  }

  // Export globally
  window.StarlineEmailJS = {
    getConfig: getEmailJsConfig,
    sendEnquiryEmail: sendEnquiryEmail,
    loadSdk: loadEmailJsSdk
  };
})();
