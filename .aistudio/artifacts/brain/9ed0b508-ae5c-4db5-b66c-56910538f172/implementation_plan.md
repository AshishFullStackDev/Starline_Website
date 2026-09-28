# Implementation Plan: Fix `net::ERR_NAME_NOT_RESOLVED` & Enable Resilient Form Submission

## Problem Analysis
When visitors submit the quote form on the live static website (`https://starlineadventures.com`), the browser encounters:
```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
Quote submission error: TypeError: Failed to fetch
```
**Cause**:
1. `js/config.js` directs production requests to `https://api.starlineadventures.com/api/enquiry`. Because the DNS record (A or CNAME) for `api.starlineadventures.com` has not yet been created by the user, the browser cannot resolve the domain name and fails with `net::ERR_NAME_NOT_RESOLVED`.
2. `js/firebase-init.js` was not loaded on the website pages, preventing the client from seamlessly falling back to saving directly to Firestore.

---

## Proposed Changes

### 1. Robust Dual-Mode Architecture in `js/config.js`
- Keep `PRODUCTION_API_URL` configurable, but test domain reachability gracefully without crashing the UI.
- Provide a clear mechanism for the form to submit directly to Firestore when running on static hosting without a deployed backend domain.

### 2. Client-Side Firebase Firestore Integration (`js/firebase-init.js`)
- Ensure Firebase Web SDK and Firestore are properly initialized using the existing client credentials (`gen-lang-client-0356205054`).
- Update `saveEnquiry` to save directly to Firestore when the backend endpoint is unreachable or unresolvable (`ERR_NAME_NOT_RESOLVED` / `Failed to fetch`).
- Store enquiry record with:
  - `id`: `SA-ENQ-XXXXXX`
  - `name`, `email`, `phone`, `message`
  - `formType`, `createdAt`, `status: "new"`
  - `pageUrl`, `referrer`

### 3. Include `js/firebase-init.js` Across Site Pages
- Add `<script src="js/firebase-init.js" defer></script>` to `contact.html`, `index.html`, `products.html`, and `product/*.html`.

### 4. Enhance Form Handlers in `js/script.js`
- Catch `Failed to fetch` / DNS resolution errors and automatically route the submission through `StarlineFirebase.saveEnquiry()`.
- Display the professional success confirmation modal with Enquiry Reference ID, WhatsApp direct chat link, and phone call option.

---

## Verification Plan
1. **Direct API Tests**: Test local and preview endpoints to ensure `/api/enquiry` continues to work when server is running.
2. **Offline / Unresolved Domain Fallback Test**: Simulate an unresolvable backend URL and verify that the form successfully saves to Firestore and presents the success modal without throwing `TypeError: Failed to fetch`.
3. **Verify All Forms**: Confirm `contact.html`, quote modal, `index.html`, and `product/*.html` forms submit cleanly.
