/*
 * Store configuration — edit this file to make the shop yours.
 * See shop/README.md for setup steps.
 */
window.STORE_CONFIG = {
  brand: "Astraea",
  tagline: "Moissanite, born of a falling star.",
  currency: "USD",
  supportEmail: "hello@example.com",

  // Leave empty to run checkout in demo mode (no real charges).
  // Paste your PayPal REST app Client ID to accept real payments:
  // https://developer.paypal.com/dashboard/applications
  paypalClientId: "",

  // Optional: an endpoint that receives each paid order as JSON so you can
  // forward it to your supplier (e.g. a Formspree form URL, Zapier/Make hook).
  orderWebhook: "",

  shipping: [
    { id: "standard", label: "Insured Standard", eta: "7–14 business days", price: 0 },
    { id: "express", label: "Insured Express", eta: "4–7 business days", price: 19 },
  ],

  // Client-side codes — anyone can read these, so treat them as public promos.
  promoCodes: {
    STARDUST10: { type: "percent", value: 10 },
    FIRSTLIGHT: { type: "fixed", value: 25 },
  },

  announcement: [
    "Free insured shipping on every order",
    "30-day returns",
    "Certificate of authenticity included",
  ],
};
