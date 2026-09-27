/* Store settings: edit these first. See README.md. */
window.KROWN = {
  brand: "KROWN Watches",
  email: "support@krownwatches.com",
  currency: "USD",

  // Leave empty for demo mode (no real charges). Paste your PayPal Client ID
  // to accept PayPal, Venmo, Pay Later and debit/credit cards.
  paypalClientId: "",

  // Optional: URL that receives each order as JSON (Formspree, Zapier, Make)
  // so you can forward it to your supplier.
  orderWebhook: "",

  freeShippingOver: 50,
  shipping: [
    { id: "standard", label: "Standard Shipping", eta: "7–12 business days", price: 4.95 },
    { id: "express", label: "Express Shipping", eta: "3–6 business days", price: 14.95 },
  ],
};
