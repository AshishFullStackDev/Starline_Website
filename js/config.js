// STARLINE ADVENTURES - UNIFIED CONFIGURATION
// Central source of truth for company contact details and links

const STARLINE_CONFIG = {
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
    // BACKEND API URL CONFIGURATION
    // ============================================================
    // The live website frontend is hosted on static hosting at https://starlineadventures.com
    // (e.g. GitHub Pages / GoDaddy static / Netlify / Vercel).
    // Static hosting cannot execute server.js, returning HTTP 405 Method Not Allowed for POST /api/enquiry.
    //
    // The Node.js / Express backend (server.js) runs on a separate Node-compatible service:
    // e.g. https://api.starlineadventures.com (Render, Railway, Cloud Run, VPS, etc.).
    //
    // REPLACE THIS VALUE with your live deployed backend URL:
    PRODUCTION_API_URL: 'https://api.starlineadventures.com/api/enquiry',

    // Local development endpoint for Express server (port 3000):
    DEVELOPMENT_API_URL: 'http://localhost:3000/api/enquiry',

    // Function to dynamically resolve the appropriate API endpoint
    getEnquiryApiUrl: function() {
        if (typeof window === 'undefined') {
            return this.PRODUCTION_API_URL;
        }

        // Support manual override for testing / staging environments
        if (window.__STARLINE_API_URL__) {
            return window.__STARLINE_API_URL__;
        }

        const host = (window.location.hostname || '').toLowerCase();

        // 1. Localhost development (Node.js Express running locally on port 3000)
        if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
            return (window.location.port === '3000') ? '/api/enquiry' : this.DEVELOPMENT_API_URL;
        }

        // 2. AI Studio Cloud Run preview environments (server.js serves both frontend & API)
        if (host.endsWith('.run.app') || host.endsWith('.google.com') || host.endsWith('.googleusercontent.com')) {
            return '/api/enquiry';
        }

        // 3. Live production domain (starlineadventures.com, www.starlineadventures.com, or custom static host)
        return this.PRODUCTION_API_URL;
    },

    // Base URL helper for other server endpoints (/api/health, /api/firebase-config)
    getBaseApiUrl: function() {
        const fullUrl = this.getEnquiryApiUrl();
        if (fullUrl.startsWith('http://') || fullUrl.startsWith('https://')) {
            try {
                const u = new URL(fullUrl);
                return u.origin;
            } catch (e) {
                return fullUrl.replace(/\/api\/enquiry\/?$/, '');
            }
        }
        return '';
    },

    // Backward-compatible property getter
    get enquiryApiUrl() {
        return this.getEnquiryApiUrl();
    },
    
    // Website metadata
    websiteUrl: 'https://starlineadventures.com',
    
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
