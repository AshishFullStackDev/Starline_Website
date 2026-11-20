// STARLINE ADVENTURES - UNIFIED CONFIGURATION
// Central source of truth for company contact details and links
var STARLINE_CONFIG = (typeof window !== 'undefined' && window.STARLINE_CONFIG) ? window.STARLINE_CONFIG : {
    // Company Information
    companyName: 'STARLINE ADVENTURES PVT LTD',
    brandName: 'STARLINE ADVENTURES',
    tagline: 'Adventure Equipment Manufacturer & Installation Expert',
    description: 'Professional adventure equipment, adventure park design, ride manufacturing, and certified installation across India.',
    
    // Contact Information
    contactPhone: '+91-94249-04000',
    contactPhoneAlt: '+91-9421-244-244',
    contactPhoneRaw: '+919424904000',
    contactEmail: 'starlineadventure@gmail.com',
    whatsappNumber: '+919424904000',
    whatsappMessage: 'Hello STARLINE ADVENTURES, I am interested in your adventure rides and would like more information.',
    
    // Address Details
    address: {
        street: '',
        city: 'Nagpur',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '441302'
    },
    addressDisplay: 'Nagpur, Maharashtra, India',
    addressFormatted: 'Nagpur, Maharashtra - 441302, India',
    
    // Year for copyright
    copyrightYear: 2026,
    
    // URLs
    mapsLink: 'https://maps.app.goo.gl/ZfGAxr5sR2J8ZRk66',

    // ============================================================
    // EMAILJS PUBLIC CONFIGURATION
    // Direct client-side email dispatch to starlineadventure@gmail.com
    // ============================================================
    emailjs: {
        serviceId: 'service_cr564i3',
        templateId: 'template_01ptjdf',
        publicKey: 'A8riesDbY_laz4ioq',
        recipientEmail: 'starlineadventure@gmail.com'
    },

    // ============================================================
    // CENTRALIZED BACKEND API CONFIGURATION (RENDER + GITHUB PAGES)
    // ============================================================
    // When the frontend is hosted statically on GitHub Pages (https://starlineadventure.com),
    // set PRODUCTION_BACKEND_URL to your deployed Render backend base URL:
    // e.g. 'https://starline-adventures-api.onrender.com'
    // Do NOT include a trailing slash or '/api/chat'.
    PRODUCTION_BACKEND_URL: 'https://YOUR-RENDER-SERVICE.onrender.com',

    // Local development backend URL (used only on localhost / 127.0.0.1)
    DEVELOPMENT_BACKEND_URL: 'http://localhost:3000',

    // Legacy compatibility fields
    PRODUCTION_API_URL: '',
    DEVELOPMENT_API_URL: 'http://localhost:3000/api/enquiry',

    _isPlaceholderBackendUrl: function(url) {
        if (!url || typeof url !== 'string') return true;
        const trimmed = url.trim();
        if (!trimmed) return true;
        const lower = trimmed.toLowerCase();
        return (
            lower.includes('your-render-service') ||
            lower.includes('your-render-backend-service') ||
            lower.includes('example.com')
        );
    },

    _normalizeBaseUrl: function(url) {
        return String(url || '').trim().replace(/\/+$/, '');
    },

    getBackendBaseUrl: function() {
        if (typeof window === 'undefined') {
            return !this._isPlaceholderBackendUrl(this.PRODUCTION_BACKEND_URL)
                ? this._normalizeBaseUrl(this.PRODUCTION_BACKEND_URL)
                : '';
        }

        // Manual runtime override for testing/staging
        if (window.__STARLINE_BACKEND_URL__) {
            return this._normalizeBaseUrl(window.__STARLINE_BACKEND_URL__);
        }

        const hostname = (window.location.hostname || '').toLowerCase();

        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return window.location.port === '3000'
                ? this._normalizeBaseUrl(window.location.origin)
                : this._normalizeBaseUrl(this.DEVELOPMENT_BACKEND_URL || 'http://localhost:3000');
        }

        // Fullstack Node preview/deployment hosts (same-origin Express server)
        if (
            hostname.endsWith('.run.app') ||
            hostname.endsWith('.googleusercontent.com') ||
            hostname.endsWith('.onrender.com')
        ) {
            return this._normalizeBaseUrl(window.location.origin);
        }

        // Static production hosting (GitHub Pages / starlineadventure.com)
        if (!this._isPlaceholderBackendUrl(this.PRODUCTION_BACKEND_URL)) {
            return this._normalizeBaseUrl(this.PRODUCTION_BACKEND_URL);
        }

        // Explicitly return empty string instead of calling GitHub Pages /api/chat (prevents HTTP 405)
        return '';
    },

    getChatEndpointInfo: function() {
        const base = this.getBackendBaseUrl();
        if (!base) {
            return {
                configured: false,
                url: null,
                errorMessage: 'AI backend URL is not configured yet. Please set PRODUCTION_BACKEND_URL in js/config.js to your deployed Render service URL.'
            };
        }
        return {
            configured: true,
            url: `${base}/api/chat`,
            healthUrl: `${base}/health`,
            enquiryUrl: `${base}/api/enquiry`,
            errorMessage: null
        };
    },

    getChatApiUrl: function() {
        const info = this.getChatEndpointInfo();
        return info.url || '';
    },

    getEnquiryBackendUrl: function() {
        const base = this.getBackendBaseUrl();
        return base ? `${base}/api/enquiry` : '';
    },

    // Function to dynamically resolve the appropriate enquiry endpoint
    getEnquiryApiUrl: function() {
        if (typeof window === 'undefined') {
            return this.PRODUCTION_API_URL || 'direct-firebase';
        }

        if (window.__STARLINE_API_URL__) {
            return window.__STARLINE_API_URL__;
        }

        const backendUrl = this.getEnquiryBackendUrl();
        if (backendUrl) {
            return backendUrl;
        }

        return 'direct-firebase';
    },

    // Base URL helper for server API endpoints (/api/health, /api/firebase-config)
    getBaseApiUrl: function() {
        return this.getBackendBaseUrl();
    },

    // Backward-compatible property getter
    get enquiryApiUrl() {
        return this.getEnquiryApiUrl();
    },
    
    // Website metadata
    websiteUrl: 'https://starlineadventure.com',
    
    // Social Media Profiles
    socialMedia: {
        facebook: 'https://www.facebook.com/starlineadventures',
        instagram: 'https://www.instagram.com/starlineadventures',
        youtube: 'https://www.youtube.com/@starlineadventures',
        linkedin: 'https://www.linkedin.com/company/starlineadventures'
    },
    
    // Function to get WhatsApp link
    getWhatsAppLink: function(customMessage = null) {
        const message = customMessage || this.whatsappMessage;
        return `https://wa.me/${this.whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
    },
    
    // Function to get phone link
    getPhoneLink: function() {
        return `tel:${this.whatsappNumber.replace(/[^\d]/g, '')}`;
    },
    
    // Function to get email link
    getEmailLink: function() {
        return `mailto:${this.contactEmail}`;
    },
    
    // Function to get WhatsApp link for product enquiry
    getProductWhatsAppLink: function(productName) {
        const message = `Hello STARLINE ADVENTURES, I would like a quote and specifications for ${productName}.`;
        return this.getWhatsAppLink(message);
    }
};

// Export for use in Node.js server if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = STARLINE_CONFIG;
}
if (typeof window !== 'undefined') {
    window.STARLINE_CONFIG = STARLINE_CONFIG;
}
