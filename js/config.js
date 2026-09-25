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

    // Enquiry backend endpoint
    enquiryApiUrl: '/api/enquiry',
    
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
