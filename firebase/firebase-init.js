/**
 * Starline Adventures - Firebase Client Integration (Modular SDK)
 * Project: starline-website-f2f87
 * Direct client-side Firestore submission for static hosting compatibility.
 */

(function () {
  'use strict';

  // NEW FIREBASE PROJECT CONFIGURATION
  const FIREBASE_CONFIG = {
    projectId: "starline-website-f2f87",
    appId: "1:1062561310475:web:starline-website-f2f87",
    apiKey: "AIzaSyCa16whyY9AL2s_DUr__85V7odYzgd0W94",
    authDomain: "starline-website-f2f87.firebaseapp.com",
    firestoreDatabaseId: "(default)",
    storageBucket: "starline-website-f2f87.firebasestorage.app",
    messagingSenderId: "1062561310475"
  };

  let firebaseApp = null;
  let firestoreDb = null;
  let modularSdk = null;
  let initPromise = null;

  async function loadModularSdk() {
    if (modularSdk) return modularSdk;
    if (initPromise) return initPromise;

    initPromise = (async function () {
      try {
        // Modern Firebase v12.19.0 Modular Web SDK loaded dynamically from Google gstatic CDN
        const appModule = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js');
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js');

        // Suppress benign internal gRPC idle stream disconnection messages
        if (typeof firestoreModule.setLogLevel === 'function') {
          firestoreModule.setLogLevel('silent');
        }

        firebaseApp = appModule.initializeApp(FIREBASE_CONFIG);
        firestoreDb = firestoreModule.getFirestore(firebaseApp);

        modularSdk = {
          initializeApp: appModule.initializeApp,
          getFirestore: firestoreModule.getFirestore,
          collection: firestoreModule.collection,
          doc: firestoreModule.doc,
          getDoc: firestoreModule.getDoc,
          setDoc: firestoreModule.setDoc,
          serverTimestamp: firestoreModule.serverTimestamp,
          app: firebaseApp,
          db: firestoreDb
        };

        return modularSdk;
      } catch (err) {
        console.warn('⚠️ [StarlineFirebase] Modular SDK load note:', err && err.message ? err.message : err);
        throw err;
      }
    })();

    return initPromise;
  }

  // Generate 6 uppercase alphanumeric characters (A-Z and 0-9)
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

  // Format: ENQ-YYYYMMDD-XXXXXX
  function generateEnquiryId(date = new Date()) {
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    const randStr = generateRandomAlphanumeric(6);
    return `ENQ-${dateStr}-${randStr}`;
  }

  // Check against existing Firestore document IDs before saving
  async function getUniqueDocumentId(sdk, preferredId = null) {
    if (preferredId && typeof preferredId === 'string' && /^ENQ-[0-9]{8}-[A-Z0-9]{6}$/.test(preferredId.trim())) {
      const cleanId = preferredId.trim();
      if (sdk && sdk.db && sdk.doc && sdk.getDoc) {
        try {
          const docRef = sdk.doc(sdk.db, 'enquiries', cleanId);
          const snap = await sdk.getDoc(docRef);
          if (!snap.exists()) return cleanId;
        } catch (e) {
          return cleanId;
        }
      } else {
        return cleanId;
      }
    }

    for (let attempt = 0; attempt < 10; attempt++) {
      const candidateId = generateEnquiryId();
      if (sdk && sdk.db && sdk.doc && sdk.getDoc) {
        try {
          const docRef = sdk.doc(sdk.db, 'enquiries', candidateId);
          const snap = await sdk.getDoc(docRef);
          if (snap && snap.exists()) {
            console.log(`[Firebase ID Check]: ID [${candidateId}] already exists. Generating new ID...`);
            continue;
          }
        } catch (e) {
          // If read is not permitted or offline, proceed with high-entropy candidate
        }
      }
      return candidateId;
    }
    return generateEnquiryId();
  }

  // Exposed API: window.StarlineFirebase
  window.StarlineFirebase = {
    config: FIREBASE_CONFIG,
    generateEnquiryId: generateEnquiryId,
    
    // Explicit initialization if called
    init: async function () {
      return await loadModularSdk();
    },

    /**
     * Save enquiry directly to Firestore: enquiries/{documentId}
     * Must strictly match deployed Firestore security rules:
     * Required keys: id, formType, name, email, phone, message, createdAt
     * Allowed optional keys: company, location, product, status
     * Prohibited keys: pageUrl, referrer, or any undeclared fields
     */
    saveEnquiry: async function (payload) {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid submission payload');
      }

      // 1. Validate inputs (Name, Email, Phone, Message)
      const name = String(payload.name || '').trim();
      const rawEmail = String(payload.email || '').trim().toLowerCase();
      let email = rawEmail;
      if (rawEmail && rawEmail !== 'no-email@starline.customer' && rawEmail !== 'not-provided@customer.com') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(rawEmail)) {
          const err = new Error('Please enter a valid email address.');
          err.field = 'email';
          throw err;
        }
      } else {
        email = 'no-email@starline.customer';
      }
      const phone = String(payload.phone || '').trim();
      const message = String(payload.message || '').trim();

      if (!name || name.length < 2) {
        const err = new Error('Please enter your full name (minimum 2 characters).');
        err.field = 'name';
        throw err;
      }

      const phoneClean = phone.replace(/[^\d+]/g, '');
      if (!phone || phoneClean.length < 8) {
        const err = new Error('Please enter a valid phone number (minimum 8 digits).');
        err.field = 'phone';
        throw err;
      }

      if (!message || message.length < 2) {
        const err = new Error('Please provide details about your project requirements.');
        err.field = 'message';
        throw err;
      }

      // 2. Load Firebase SDK
      let sdk = null;
      try {
        sdk = await loadModularSdk();
      } catch (loadErr) {
        console.error('Failed to load Firebase SDK:', loadErr);
      }

      // 3. Generate unique enquiry document ID (Format: ENQ-YYYYMMDD-XXXXXX) with existence check
      const rawId = payload.id && typeof payload.id === 'string' ? payload.id.trim() : '';
      const documentId = await getUniqueDocumentId(sdk, rawId);

      // 4. Construct exact document matching deployed Firestore rules
      // STRICT: Must include ONLY the allowed keys defined in the rules
      const cleanDoc = {
        id: String(documentId).slice(0, 128),
        formType: String(payload.formType || 'Get a Quote').slice(0, 64),
        name: name.slice(0, 100),
        email: email.slice(0, 120),
        phone: phone.slice(0, 30),
        message: message.slice(0, 2000),
        company: String(payload.company || 'N/A').slice(0, 120),
        location: String(payload.location || 'Not specified').slice(0, 120),
        product: String(payload.product || 'General Adventure Project Enquiry').slice(0, 120),
        status: String(payload.status || 'new').slice(0, 30),
        createdAt: (sdk && sdk.serverTimestamp) ? sdk.serverTimestamp() : new Date().toISOString()
      };

      // 5. Save to Firestore: enquiries/{documentId}
      let firestoreSaved = false;
      if (sdk && sdk.db) {
        try {
          const docRef = sdk.doc(sdk.db, 'enquiries', documentId);
          await sdk.setDoc(docRef, cleanDoc);
          firestoreSaved = true;
          console.log(`✅ [StarlineFirebase] Enquiry successfully saved to Firestore: enquiries/${documentId}`);
        } catch (fsErr) {
          console.error('❌ [StarlineFirebase] Direct Firestore write error:', fsErr && fsErr.message ? fsErr.message : fsErr);
          throw fsErr;
        }
      } else {
        const connErr = new Error('Could not establish connection to Firebase Firestore. Please check your network and try again.');
        console.error('❌ [StarlineFirebase]', connErr.message);
        throw connErr;
      }

      // 6. Trigger EmailJS Client-Side Dispatch (Requirements #3, #4, #7, #8, #9, #10)
      let emailResult = { sent: false, error: null };
      try {
        if (typeof window !== 'undefined') {
          if (!window.StarlineEmailJS) {
            try {
              await import('/js/emailjs-service.js');
            } catch (e) {}
          }
          if (window.StarlineEmailJS && typeof window.StarlineEmailJS.sendEnquiryEmail === 'function') {
            emailResult = await window.StarlineEmailJS.sendEnquiryEmail(cleanDoc);
          }
        }
      } catch (emailErr) {
        console.warn('⚠️ [EmailJS Notice]: Dispatch note:', emailErr && emailErr.message ? emailErr.message : emailErr);
        emailResult = { sent: false, error: emailErr && emailErr.message ? emailErr.message : 'Email dispatch error' };
      }

      // 7. Save lead locally so it is permanently stored in browser
      try {
        const offlineKey = 'starline_enquiries_saved';
        const existing = JSON.parse(localStorage.getItem(offlineKey) || '[]');
        existing.unshift(Object.assign({}, cleanDoc, { 
          savedAt: new Date().toISOString(),
          firestoreSaved,
          emailSent: emailResult.sent,
          emailError: emailResult.error || null
        }));
        localStorage.setItem(offlineKey, JSON.stringify(existing.slice(0, 50)));
      } catch (lsErr) {}

      return {
        ok: true,
        id: documentId,
        enquiryId: documentId,
        firestoreSaved: true,
        emailSent: emailResult.sent,
        emailError: emailResult.error || null,
        message: emailResult.sent
          ? "Thank you! Your enquiry has been received and emailed to starlineadventure@gmail.com."
          : "Thank you! Your enquiry has been safely received and stored in our database.",
        customerMessage: emailResult.sent
          ? "Thank you! Your enquiry has been safely saved in our system and an email was sent to starlineadventure@gmail.com."
          : "Thank you! Your enquiry has been securely recorded. Our team will review your requirements and reach out to you shortly."
      };
    }
  };

  // Lazy-load SDK: Preload on first user interaction with forms/inputs or on saveEnquiry
  if (typeof document !== 'undefined') {
    const triggerLazyInit = function () {
      loadModularSdk().catch(() => {});
      document.removeEventListener('focusin', triggerLazyInit);
      document.removeEventListener('pointerdown', triggerLazyInit);
    };
    document.addEventListener('focusin', triggerLazyInit, { once: true, passive: true });
    document.addEventListener('pointerdown', triggerLazyInit, { once: true, passive: true });
  }
})();
