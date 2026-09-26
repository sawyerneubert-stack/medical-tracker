# Astraea — Moissanite Dropship Store

A static storefront: no build step, no server, no monthly platform fee. You can host it anywhere that serves plain HTML (GitHub Pages, Netlify, Cloudflare Pages).

```
shop/
  index.html      storefront: hero, collection, story, diamond comparison, FAQ
  checkout.html   checkout: address, delivery, promo code, payment, confirmation
  css/style.css
  js/config.js    brand name, PayPal ID, shipping rates, promo codes  ← edit first
  js/catalog.js   products, prices, metal upgrades, ring sizes          ← edit second
  js/art.js       generates the jewelry illustrations
  js/cart.js      cart (saved in the visitor's browser)
  js/store.js     storefront behaviour
  js/checkout.js  checkout + PayPal
```

## Run it locally

```bash
cd shop && python3 -m http.server 8000
# open http://localhost:8000
```

## Go live checklist

1. **Brand.** In `js/config.js`, set `brand`, `tagline`, and `supportEmail`. Brand text in the HTML is filled in from here automatically.
2. **Products and prices.** Edit `js/catalog.js` so it matches your supplier's catalog. Set `price` to the silver base price (your supplier cost plus margin) and the metal `add` amounts to the gold upgrades. Remove any claim your supplier can't back up, such as "D colour VVS1" or "certificate included". The same applies to the promises and FAQ in `index.html`: returns window, shipping times, and certificates.
3. **Photos (recommended).** Add `image: "img/orbit-solitaire.jpg"` to a product and it will use the photo instead of the drawn illustration. Ask your supplier for photos you have the rights to use.
4. **Payments.** Create a PayPal Business account, then a REST app at developer.paypal.com, and paste its **Client ID** into `paypalClientId`. Checkout then shows PayPal, Venmo, Pay Later, and plain debit/credit card buttons. Try it first with a Sandbox client ID.
5. **Order notifications (for fulfilment).** Every paid order appears in your PayPal dashboard with the shipping address and line items. To also receive the order as JSON (SKU, metal, tone, ring size), set `orderWebhook` to a Formspree form URL or a Zapier/Make webhook, and forward it to your supplier from there.
6. **Host it.** On GitHub Pages, enable Pages for this repo; the store will be at `https://<user>.github.io/<repo>/shop/`. You can connect a custom domain in the Pages settings.

## Things to know

- **Price verification.** Prices live in the browser, so a technical user could tamper with the amount sent to PayPal. Before you order from your supplier, check that the paid total in PayPal matches the items. If you grow, move order creation to a small server function, or migrate to Shopify or Stripe Checkout.
- **Promo codes** in `config.js` are visible to anyone who views the page source, so only use public promos.
- **Sales tax and VAT** are not calculated. Check what applies where you sell.
- **Legal pages.** Add a privacy policy, terms, and a refund policy before taking real orders; PayPal and ad platforms expect them.
- The diamond prices in the savings calculator are rough illustrative estimates and are labelled as such on the page.
