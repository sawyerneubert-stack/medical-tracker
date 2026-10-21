/* Shared across every page: header, footer, cart storage, product cards. */
(function () {
  const cfg = window.KROWN;
  const CART_KEY = "krown_cart";
  let memoryCart = [];

  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: cfg.currency });
  const money = (n) => fmt.format(n);
  const shortMoney = (n) => fmt.format(n).replace(/\.00$/, "");
  const product = (id) => window.PRODUCTS.find((p) => p.id === id);
  const param = (name) => new URLSearchParams(location.search).get(name);
  // A watch can offer colors (colors: [{ name, swatch, images }]) or another choice
  // (options: { label: "Strap Size", values: ["S", "M", "L"] }). Customers pick one before adding to cart.
  window.PRODUCTS.forEach((p) => {
    if (p.colors && p.colors.length && !p.images) p.images = p.colors[0].images;
  });
  const optionOf = (p) => {
    if (p && p.colors && p.colors.length) return { label: "Color", values: p.colors.map((c) => c.name), colors: p.colors };
    return p && p.options && p.options.values && p.options.values.length ? p.options : null;
  };
  // Photos for the chosen color (or the watch's normal photos).
  const imagesFor = (p, value) => {
    const c = p.colors && p.colors.find((x) => x.name === value);
    return c ? c.images : p.images;
  };
  const safeColor = (v) => (/^[#a-zA-Z0-9(),.%\s-]{1,40}$/.test(v || "") ? v : "#ccc");
  const swatchHTML = (c) => `<span class="swatch" style="background:${safeColor(c.swatch)}"></span>`;
  const optionText = (p, value) => (value && optionOf(p) ? `${optionOf(p).label}: ${value}` : "");

  const LOGO = `<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M3 19 5 6l6.5 6.5L16 3l4.5 9.5L27 6l2 13Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 22h24" stroke="currentColor" stroke-width="1.6"/></svg>`;

  /* ---------- Cart (stored in the browser; prices always come from the catalog) ---------- */
  const key = (l) => l.id + "|" + (l.size || "");

  function readCart() {
    let raw;
    try {
      raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (e) {
      raw = memoryCart;
    }
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((l) => l && product(l.id))
      .map((l) => ({
        id: l.id,
        size: optionOf(product(l.id)) && optionOf(product(l.id)).values.includes(l.size) ? l.size : null,
        qty: Math.min(10, Math.max(1, parseInt(l.qty, 10) || 1)),
      }))
      .filter((l) => !optionOf(product(l.id)) || l.size);
  }

  function writeCart(lines) {
    memoryCart = lines;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch (e) {
      /* private mode: cart lives in memory for this page */
    }
    document.dispatchEvent(new CustomEvent("cart:change"));
  }

  const Cart = {
    lines: readCart,
    key,
    add(id, size, qty = 1) {
      const lines = readCart();
      const found = lines.find((l) => key(l) === key({ id, size }));
      if (found) found.qty = Math.min(10, found.qty + qty);
      else lines.push({ id, size: size || null, qty });
      writeCart(lines);
    },
    setQty(k, qty) {
      writeCart(readCart().map((l) => (key(l) === k ? { ...l, qty: Math.min(10, qty) } : l)).filter((l) => l.qty > 0));
    },
    remove(k) {
      writeCart(readCart().filter((l) => key(l) !== k));
    },
    clear() {
      writeCart([]);
    },
    count() {
      return readCart().reduce((n, l) => n + l.qty, 0);
    },
    // All amounts in cents to avoid rounding errors.
    totals(shippingId = "standard") {
      const lines = readCart();
      const subtotal = lines.reduce((n, l) => n + Math.round(product(l.id).price * 100) * l.qty, 0);
      const method = cfg.shipping.find((s) => s.id === shippingId) || cfg.shipping[0];
      const freeStd = method.id === "standard" && subtotal >= cfg.freeShippingOver * 100;
      const shipping = !lines.length || freeStd ? 0 : Math.round(method.price * 100);
      return { lines, subtotal, shipping, total: subtotal + shipping };
    },
  };

  /* ---------- Header / footer ---------- */
  function renderChrome() {
    const page = document.body.dataset.page;
    const header = $("#site-header");
    if (header) {
      header.innerHTML = `
        <nav class="nav">
          <div class="container nav-inner">
            <a href="index.html" class="logo" aria-label="${esc(cfg.brand)} home">${LOGO}<span>KROWN<small>WATCHES</small></span></a>
            <div class="nav-links">
              <a href="shop.html" ${page === "shop" ? 'aria-current="page"' : ""}>Shop</a>
              <a href="about.html" ${page === "about" ? 'aria-current="page"' : ""}>About</a>
              <a href="cart.html" class="cart-link" ${page === "cart" ? 'aria-current="page"' : ""}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
                Cart <span class="cart-count" data-cart-count>0</span>
              </a>
            </div>
          </div>
        </nav>`;
    }
    const footer = $("#site-footer");
    if (footer) {
      footer.innerHTML = `
        <div class="container footer-grid">
          <div>
            <a href="index.html" class="logo">${LOGO}<span>KROWN<small>WATCHES</small></span></a>
            <p class="footer-note">Timepieces made for every moment.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>${window.CATEGORIES.map((c) => `<li><a href="shop.html?cat=${c.id}">${esc(c.name)}</a></li>`).join("")}</ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul>
              <li><a href="help.html#contact">Contact</a></li>
              <li><a href="help.html#faq">FAQ</a></li>
              <li><a href="help.html#shipping">Shipping</a></li>
              <li><a href="help.html#returns">Returns</a></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><a href="help.html#privacy">Privacy Policy</a></li>
              <li><a href="help.html#terms">Terms</a></li>
            </ul>
          </div>
        </div>
        <div class="container footer-bottom">
          <span>© ${new Date().getFullYear()} ${esc(cfg.brand)}</span>
          <span class="pay-icons" aria-label="Accepted payments">VISA · MASTERCARD · AMEX · PAYPAL</span>
        </div>`;
    }
    updateCount();
  }

  function updateCount() {
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      const n = Cart.count();
      el.textContent = n;
      el.hidden = n === 0;
    });
  }
  document.addEventListener("cart:change", updateCount);
  window.addEventListener("storage", (e) => e.key === CART_KEY && document.dispatchEvent(new CustomEvent("cart:change")));

  /* ---------- Product card ---------- */
  function priceHTML(p) {
    return `<span class="price">${money(p.price)}</span>${p.compareAt ? `<s class="compare">${money(p.compareAt)}</s>` : ""}`;
  }

  function cardHTML(p) {
    const url = `product.html?id=${encodeURIComponent(p.id)}`;
    return `<article class="card">
      <a href="${url}" class="card-img">
        ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
        <img src="${esc(p.images[0])}" alt="${esc(p.name)}" loading="lazy" width="600" height="600">
        ${p.images[1] ? `<img class="alt" src="${esc(p.images[1])}" alt="" loading="lazy" width="600" height="600">` : ""}
      </a>
      <div class="card-info">
        <a href="${url}" class="card-name">${esc(p.name)}</a>
        <div class="card-price">${priceHTML(p)}</div>
        ${p.colors && p.colors.length > 1 ? `<div class="card-swatches" title="${p.colors.length} colors">${p.colors.map(swatchHTML).join("")}</div>` : ""}
        <button class="btn btn-outline btn-sm" data-add="${esc(p.id)}">Add to Cart</button>
      </div>
    </article>`;
  }

  /* ---------- Add to cart (asks for the option first if the product has one) ---------- */
  function addToCart(id, size, qty = 1) {
    const p = product(id);
    if (!p) return;
    if (optionOf(p) && !size) return pickSize(p, (s) => addToCart(id, s, qty));
    Cart.add(id, size, qty);
    toast(`<b>${esc(p.name)}</b>${size ? " · " + esc(optionText(p, size)) : ""} added to cart <a href="cart.html">View Cart</a>`);
  }

  function pickSize(p, done) {
    let dlg = $("#size-dialog");
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.id = "size-dialog";
      dlg.className = "size-dialog";
      document.body.appendChild(dlg);
    }
    dlg.innerHTML = `<form method="dialog">
      <button class="dialog-close" value="cancel" aria-label="Close">✕</button>
      <h3>Select ${esc(optionOf(p).label)}</h3>
      <p>${esc(p.name)} · ${money(p.price)}</p>
      ${
        optionOf(p).colors
          ? `<div class="color-grid">${optionOf(p).colors.map((c) => `<button class="color-btn" value="${esc(c.name)}">${swatchHTML(c)}${esc(c.name)}</button>`).join("")}</div>`
          : `<div class="size-grid">${optionOf(p).values.map((s) => `<button class="size-btn" value="${esc(s)}">${esc(s)}</button>`).join("")}</div>`
      }
    </form>`;
    dlg.onclose = () => {
      if (optionOf(p).values.includes(dlg.returnValue)) done(dlg.returnValue);
    };
    dlg.returnValue = "";
    dlg.showModal();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (btn) addToCart(btn.dataset.add);
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(html) {
    let t = $("#toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.innerHTML = html;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  window.K = { cfg, $, esc, money, shortMoney, product, param, optionOf, optionText, imagesFor, swatchHTML, Cart, cardHTML, priceHTML, addToCart, toast };
  renderChrome();
})();
