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
      if (this.initialized) return true;

      try {
        const response = await fetch('/api/firebase-config');
        if (!response.ok) {
          console.warn('[StarlineFirebase]: Could not fetch Firebase config from server.');
          return false;
        }

        const data = await response.json();
        if (!data.ok || !data.config) {
          console.warn('[StarlineFirebase]: Invalid Firebase configuration response.');
          return false;
        }

        this.config = data.config;

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

          if (this.config.firestoreDatabaseId) {
            this.db = firebase.app().firestore(this.config.firestoreDatabaseId);
          } else {
            this.db = firebase.firestore();
          }

          this.auth = firebase.auth();
          this.initialized = true;
          console.log('🔥 [StarlineFirebase]: Client SDK initialized successfully with project:', this.config.projectId);
          return true;
        }
      } catch (err) {
        console.warn('🔥 [StarlineFirebase]: Initialization error:', err.message);
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

    // Submit an enquiry through the secured backend API
    saveEnquiry: async function (enquiryData) {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryData)
      });
      const data = await response.json();
      if (!response.ok || !data || data.ok === false) {
        throw new Error((data && data.error) || 'Failed to submit enquiry via API');
      }
      return data;
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
