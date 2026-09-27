# KROWN Watches: Storefront

A fast, static e-commerce site. Plain HTML, CSS and JavaScript: no build step, no database, no monthly platform fee. You can host it free on GitHub Pages, Netlify or Cloudflare Pages.

## Pages

| Page | File |
|---|---|
| Home (slideshow cover, Moissanite / Classic collections, bestsellers, reviews) | `index.html` |
| Shop all / by category | `shop.html`, `shop.html?cat=moissanite` |
| Product page (photos, add to cart, buy now) | `product.html?id=…` |
| Cart (change quantity, remove, free-shipping bar) | `cart.html` |
| Secure checkout | `checkout.html` |
| Order confirmation | `confirmation.html` |
| About | `about.html` |
| Contact, FAQ, Shipping, Returns, Privacy, Terms | `help.html#contact` etc. |

## Preview locally

```bash
cd krown && python3 -m http.server 8000   # then open http://localhost:8000
```

## Make it yours

1. **Settings:** `js/config.js` holds your support email, free-shipping threshold, shipping rates and payment keys.
2. **Products:** `js/products.js` holds names, prices, compare-at prices, descriptions, details and badges ("Bestseller" watches show first on the homepage). A watch can also have an `options` choice (e.g. strap color) that customers pick before adding it to the cart.
3. **Photos:** the images in `images/` are computer-generated placeholders. Replace them with your supplier's or your own photos:
   - Easiest: overwrite a file and keep its name (e.g. `images/products/classic-heritage-1.jpg`).
   - Square images of about 1000×1000 px look best. The first photo is the main one; the second shows when a shopper hovers over a card.
   - **More photos for a watch:** upload the next number (e.g. `classic-heritage-4.jpg`), then in `js/products.js` change that watch's `photos("classic-heritage", 3)` to `4`.
4. **Cover slideshow:** in `index.html`, find `const heroSlides =` and list the product ids you want to feature, in order. It moves on its own every 4.5 seconds, and shoppers can also use the arrows, dots or swipe.
5. **Collections:** `window.CATEGORIES` in `js/products.js` defines the two homepage sections (Moissanite Watches and Classic Watches): name, short description and image. Set each product's `category` to `"moissanite"` or `"classic"`.
6. **Reviews:** the three homepage reviews are **placeholders**. Replace them with real customer reviews before launch; publishing invented reviews is illegal in the US (FTC) and many other countries.
7. **Policies:** Privacy Policy and Terms in `help.html` are template text. Have them checked for your business, and make sure the shipping times, return window and materials match what your supplier actually provides.

## Taking payments

Checkout runs in **demo mode** until you connect payments (no one is charged).

1. Create a free **PayPal Business** account.
2. At developer.paypal.com → Apps & Credentials, create an app and copy its **Client ID** (test with the Sandbox ID first).
3. Paste it into `paypalClientId` in `js/config.js`.

Customers can then pay by **debit/credit card**, PayPal, Venmo or Pay Later. Card details are entered in PayPal's secure form and never touch your site. Every paid order appears in your PayPal account with the customer's shipping address.

**Order alerts for dropshipping:** set `orderWebhook` to a Formspree form URL or a Zapier/Make webhook to receive every order (items, chosen options, address) by email or in a spreadsheet, ready to send to your supplier.

**Before fulfilling an order,** check that the amount received in PayPal matches the items ordered. Prices are calculated in the browser, so a technical user could alter them. As you grow, consider moving to Shopify or adding a small server-side checkout.

## Going live on GitHub Pages

Repository → Settings → Pages → deploy from your branch. The store will be at `https://<username>.github.io/<repo>/krown/`. You can add a custom domain (e.g. krownwatches.com) on the same settings page.
