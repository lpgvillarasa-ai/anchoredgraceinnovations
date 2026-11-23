// One place for the contact address and the texting rules, so the contact form, the
// SMS terms page and the privacy policy always say the same thing.
// The address is on the website's own domain (anchoredgraceinnovation.com), which is
// added to Lee's Google Workspace as an alias domain, so it reaches his usual inbox.
export const CONTACT_EMAIL = 'lee@anchoredgraceinnovation.com';
export const BUSINESS_NAME = 'Anchored Grace Innovations';

// When the SMS terms (and the consent wording on the form) last changed. The form sends
// this version with every consent, so each saved "yes" says which wording it agreed to.
export const SMS_TERMS_UPDATED = '5 November 2026';
export const SMS_CONSENT_VERSION = '2026-11-05';

// What the texts are about: service texts only, no marketing (Lee, 2026-11-05). It must
// match the campaign registered in Zoom Phone.
export const SMS_TOPICS = 'your enquiry, quotes, scheduled calls and project updates';
// The same topics in the visitor's own words, for the consent box ("I agree ... about my enquiry").
export const SMS_TOPICS_MINE = 'my enquiry, quotes, scheduled calls and project updates';
