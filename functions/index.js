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
 * Note: Email delivery has been migrated to client-side EmailJS (service_cr564i3).
 * Cloud Function execution is bypassed.
 */
exports.sendEnquiryNotification = onDocumentCreated('enquiries/{enquiryId}', async (event) => {
  console.log(`[Notice]: Enquiry document detected: ${event.params ? event.params.enquiryId : 'unknown'}. Email delivery is handled client-side via EmailJS.`);
  return { bypassed: true, handler: 'emailjs' };
});

