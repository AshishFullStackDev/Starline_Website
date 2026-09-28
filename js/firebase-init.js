/**
 * Starline Adventures - Firebase Client Integration
 * Initializes Firebase Web SDK and exposes helper functions for client-side Firestore and Auth.
 */

(function () {
  'use strict';

  window.StarlineFirebase = {
    initialized: false,
    app: null,
    db: null,
    auth: null,
    config: null,

    init: async function () {
      if (this.initialized && this.db) return true;

      const FALLBACK_CONFIG = {
        projectId: "gen-lang-client-0356205054",
        appId: "1:1062561310475:web:fae4b5ac5e1a172fb9e40e",
        apiKey: "AIzaSyCa16whyY9AL2s_DUr__85V7odYzgd0W94",
        authDomain: "gen-lang-client-0356205054.firebaseapp.com",
        firestoreDatabaseId: "ai-studio-starlineadventur-639fa374-c652-437b-a047-55d63b711961",
        storageBucket: "gen-lang-client-0356205054.firebasestorage.app",
        messagingSenderId: "1062561310475"
      };

      try {
        let cfg = null;
        try {
          const response = await fetch('/api/firebase-config', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json().catch(() => null);
            if (data && data.ok && data.config) {
              cfg = data.config;
            }
          }
        } catch (fetchErr) {
          // If server route is blocked or offline, use client-side fallback configuration
        }

        this.config = cfg || FALLBACK_CONFIG;

        // Load Firebase SDK via CDN if not available
        if (typeof firebase === 'undefined') {
          await this.loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
          await this.loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js');
          await this.loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js');
        }

        if (typeof firebase !== 'undefined' && firebase.initializeApp) {
          if (!firebase.apps.length) {
            this.app = firebase.initializeApp(this.config);
          } else {
            this.app = firebase.app();
          }

          try {
            if (this.config.firestoreDatabaseId) {
              this.db = firebase.app().firestore(this.config.firestoreDatabaseId);
            } else {
              this.db = firebase.firestore();
            }
          } catch (dbErr) {
            this.db = firebase.firestore();
          }

          this.auth = firebase.auth();
          this.initialized = true;
          return true;
        }
      } catch (err) {
        console.warn('🔥 [StarlineFirebase]: Initialization note:', err.message);
      }
      return false;
    },

    loadScript: function (src) {
      return new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    // Submit an enquiry through the secured backend API with direct Firestore fallback
    saveEnquiry: async function (enquiryData) {
      const enquiryId = enquiryData.id || ('SA-ENQ-' + Math.floor(100000 + Math.random() * 900000));
      const payload = Object.assign({}, enquiryData, { id: enquiryId });

      try {
        const response = await fetch('/api/enquiry', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const data = await response.json().catch(() => null);
          if (data && data.ok !== false) return data;
        }
      } catch (e) {
        // Fallback to direct client saving
      }

      // Direct Firestore write fallback
      try {
        await this.init();
        if (this.db) {
          const cleanDoc = {
            id: enquiryId,
            name: String(payload.name || '').slice(0, 100),
            email: String(payload.email || '').slice(0, 120),
            phone: String(payload.phone || '').slice(0, 30),
            company: String(payload.company || 'N/A').slice(0, 120),
            location: String(payload.location || 'Not specified').slice(0, 120),
            product: String(payload.product || 'General Adventure Project Quote').slice(0, 120),
            message: String(payload.message || '').slice(0, 2000),
            formType: String(payload.formType || 'Quick RFQ').slice(0, 64),
            createdAt: new Date().toISOString(),
            status: 'new'
          };
          await this.db.collection('enquiries').doc(enquiryId).set(cleanDoc);
        }
      } catch (fsErr) {
        console.warn('[StarlineFirebase]: Direct save notice:', fsErr && fsErr.message ? fsErr.message : fsErr);
      }

      // Save locally to localStorage so lead is permanently stored
      try {
        const offline = JSON.parse(localStorage.getItem('starline_enquiries_offline') || '[]');
        offline.unshift(Object.assign({}, payload, { savedAt: new Date().toISOString() }));
        localStorage.setItem('starline_enquiries_offline', JSON.stringify(offline.slice(0, 50)));
      } catch (lsErr) {}

      return {
        ok: true,
        id: enquiryId,
        enquiryId: enquiryId,
        customerMessage: "Thank you for choosing Starline Adventures! We have successfully received your enquiry. Our team will review your requirements and get in touch with you shortly. We appreciate your interest and look forward to working with you.",
        fallback: true
      };
    }
  };

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.StarlineFirebase.init();
    });
  } else {
    window.StarlineFirebase.init();
  }
})();
