/*
 * Checkout: shipping form, order summary, promo codes, and payment.
 * Payment uses PayPal Smart Buttons (PayPal, Venmo, Pay Later and debit/credit
 * cards) when `paypalClientId` is set in config.js; otherwise it runs in demo
 * mode so you can test the whole flow without charging anyone.
 */
(function () {
  const { esc, money, product, unitPrice, Cart, cfg } = window.Shop;
  const $ = (s, el = document) => el.querySelector(s);
  const main = $("#main");
  const cents = (n) => Math.round(n * 100);
  const dollars = (c) => (c / 100).toFixed(2);

  document.querySelectorAll("[data-brand]").forEach((el) => (el.textContent = cfg.brand));
  document.title = `Checkout — ${cfg.brand}`;

  const COUNTRIES = [
    ["US", "United States"], ["CA", "Canada"], ["GB", "United Kingdom"], ["AU", "Australia"],
    ["NZ", "New Zealand"], ["IE", "Ireland"], ["DE", "Germany"], ["FR", "France"],
    ["NL", "Netherlands"], ["ES", "Spain"], ["IT", "Italy"], ["SE", "Sweden"],
  ];

  const state = {
    shipping: cfg.shipping[0].id,
    promo: null, // { code, type, value }
  };

  function totals() {
    const lines = Cart.lines();
    const subtotal = lines.reduce((n, l) => n + cents(unitPrice(product(l.id), l.metal)) * l.qty, 0);
    let discount = 0;
    if (state.promo) {
      discount = state.promo.type === "percent" ? Math.round((subtotal * state.promo.value) / 100) : cents(state.promo.value);
      discount = Math.min(discount, subtotal);
    }
    const ship = cents((cfg.shipping.find((s) => s.id === state.shipping) || cfg.shipping[0]).price);
    return { lines, subtotal, discount, ship, total: subtotal - discount + ship };
  }

  /* ---------- Layout ---------- */
  function renderEmpty() {
    main.innerHTML = `<div class="wrap confirm">
      <div class="ring-wrap">${window.renderPiece({ type: "ring", style: "solitaire", shape: "round" }, "white", "")}</div>
      <h1 class="display">Your bag is empty</h1>
      <p>Find your star first — then come back here to make it yours.</p>
      <br><a class="btn btn-gold" href="index.html#shop">Browse the collection</a>
    </div>`;
  }

  function field(id, label, opts = {}) {
    const { type = "text", auto = "", full = false, optional = false } = opts;
    return `<div class="field${full ? " full" : ""}">
      <label for="${id}">${label}${optional ? " <span>(optional)</span>" : ""}</label>
      <input id="${id}" name="${id}" type="${type}" autocomplete="${auto}" ${optional ? "" : "required"}>
    </div>`;
  }

  function renderCheckout() {
    main.innerHTML = `<div class="wrap">
      <div class="steps"><span>Bag</span><span>›</span><span class="on">Details &amp; payment</span><span>›</span><span>Confirmation</span></div>
      <div class="checkout">
        <form id="form" novalidate>
          <h1 class="display">Checkout</h1>
          <fieldset class="fieldset">
            <legend>Contact</legend>
            <div class="fields">
              ${field("email", "Email", { type: "email", auto: "email", full: true })}
              ${field("phone", "Phone", { type: "tel", auto: "tel", full: true, optional: true })}
            </div>
          </fieldset>
          <fieldset class="fieldset">
            <legend>Shipping address</legend>
            <div class="fields">
              ${field("first", "First name", { auto: "given-name" })}
              ${field("last", "Last name", { auto: "family-name" })}
              ${field("address1", "Address", { auto: "address-line1", full: true })}
              ${field("address2", "Apartment, suite, etc.", { auto: "address-line2", full: true, optional: true })}
              ${field("city", "City", { auto: "address-level2" })}
              ${field("region", "State / Province", { auto: "address-level1" })}
              ${field("postal", "ZIP / Postal code", { auto: "postal-code" })}
              <div class="field">
                <label for="country">Country</label>
                <select id="country" name="country" autocomplete="country" required>
                  ${COUNTRIES.map(([c, n]) => `<option value="${c}">${n}</option>`).join("")}
                </select>
              </div>
            </div>
          </fieldset>
          <fieldset class="fieldset">
            <legend>Delivery</legend>
            <div class="ship-options">
              ${cfg.shipping
                .map(
                  (s) => `<label class="ship-opt">
                    <input type="radio" name="shipping" value="${esc(s.id)}" ${s.id === state.shipping ? "checked" : ""}>
                    <div>${esc(s.label)}<small>${esc(s.eta)}</small></div>
                    <b>${s.price ? money(s.price) : "Free"}</b>
                  </label>`
                )
                .join("")}
            </div>
          </fieldset>
          <fieldset class="fieldset">
            <legend>Payment</legend>
            <div class="pay-box">
              <div id="pay-error" class="field-error" hidden style="margin:0 0 12px"></div>
              <div id="pay-area"></div>
            </div>
          </fieldset>
        </form>
        <aside class="summary" aria-label="Order summary">
          <h2>Order summary</h2>
          <div id="sum-lines"></div>
          <div class="promo">
            <label for="promo" class="sr-only">Promo code</label>
            <input id="promo" placeholder="Promo code" autocomplete="off">
            <button class="btn btn-ghost" id="apply-promo" type="button">Apply</button>
          </div>
          <div class="promo-msg" id="promo-msg" hidden></div>
          <div class="totals" id="totals"></div>
          <div class="trust-row"><span>Insured shipping</span><span>30-day returns</span><span>Certificate included</span></div>
        </aside>
      </div>
    </div>`;

    $("#form").addEventListener("change", (e) => {
      if (e.target.name === "shipping") {
        state.shipping = e.target.value;
        renderSummary();
      }
    });
    $("#form").addEventListener("input", (e) => {
      const f = e.target.closest(".field");
      if (f) f.classList.remove("invalid");
      if (!$("#form .field.invalid")) showPayError("");
    });
    $("#form").addEventListener("submit", (e) => e.preventDefault());
    $("#apply-promo").addEventListener("click", applyPromo);
    $("#promo").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyPromo();
      }
    });

    renderSummary();
    renderPayment();
  }

  function renderSummary() {
    const t = totals();
    $("#sum-lines").innerHTML = t.lines
      .map((l) => {
        const p = product(l.id);
        return `<div class="line">
          <div class="line-art">${p.image ? `<img src="${esc(p.image)}" alt="">` : window.renderPiece(p.art, l.tone, p.name)}<i>${l.qty}</i></div>
          <div><h4>${esc(p.name)}</h4><small>${esc(Cart.describe(l))}</small></div>
          <div class="line-price">${money(unitPrice(p, l.metal) * l.qty)}</div>
        </div>`;
      })
      .join("");
    $("#totals").innerHTML = `
      <div class="row"><span>Subtotal</span><b>${money(t.subtotal / 100)}</b></div>
      ${t.discount ? `<div class="row"><span>Discount (${esc(state.promo.code)})</span><b>−${money(t.discount / 100)}</b></div>` : ""}
      <div class="row"><span>Shipping</span><b>${t.ship ? money(t.ship / 100) : "Free"}</b></div>
      <div class="row grand"><span>Total</span><b>${money(t.total / 100)}</b></div>`;
  }

  function applyPromo() {
    const code = $("#promo").value.trim().toUpperCase();
    const msg = $("#promo-msg");
    const found = cfg.promoCodes[code];
    msg.hidden = false;
    if (!code) {
      msg.hidden = true;
      return;
    }
    if (found) {
      state.promo = { code, ...found };
      msg.className = "promo-msg ok";
      msg.textContent = `${code} applied — ${found.type === "percent" ? found.value + "% off" : money(found.value) + " off"}.`;
    } else {
      state.promo = null;
      msg.className = "promo-msg bad";
      msg.textContent = "That code isn't valid.";
    }
    renderSummary();
  }

  /* ---------- Validation ---------- */
  function readForm() {
    const v = (id) => $("#" + id).value.trim();
    return {
      email: v("email"), phone: v("phone"),
      first: v("first"), last: v("last"),
      address1: v("address1"), address2: v("address2"),
      city: v("city"), region: v("region"), postal: v("postal"), country: v("country"),
    };
  }

  function validate() {
    let firstBad = null;
    $("#form").querySelectorAll("input[required], select[required]").forEach((el) => {
      const ok = el.value.trim() && (el.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.closest(".field").classList.toggle("invalid", !ok);
      if (!ok && !firstBad) firstBad = el;
    });
    if (firstBad) {
      firstBad.focus();
      showPayError("Please complete the highlighted fields.");
      return false;
    }
    showPayError("");
    return true;
  }

  function showPayError(msg) {
    const el = $("#pay-error");
    el.textContent = msg;
    el.hidden = !msg;
  }

  /* ---------- Order ---------- */
  function buildOrder(payment) {
    const t = totals();
    const c = readForm();
    return {
      orderNumber: "AST-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      createdAt: new Date().toISOString(),
      customer: c,
      shippingMethod: state.shipping,
      promoCode: state.promo ? state.promo.code : null,
      items: t.lines.map((l) => {
        const p = product(l.id);
        return { sku: p.id, name: p.name, options: Cart.describe(l), qty: l.qty, unitPrice: dollars(cents(unitPrice(p, l.metal))) };
      }),
      subtotal: dollars(t.subtotal),
      discount: dollars(t.discount),
      shipping: dollars(t.ship),
      total: dollars(t.total),
      currency: cfg.currency,
      payment,
    };
  }

  function notify(order) {
    if (!cfg.orderWebhook) return Promise.resolve();
    return fetch(cfg.orderWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(order),
      keepalive: true,
    }).catch(() => {});
  }

  async function finish(order) {
    await notify(order);
    window.scrollTo(0, 0);
    main.innerHTML = `<div class="wrap confirm">
      <div class="ring-wrap">${window.renderPiece({ type: "ring", style: "halo", shape: "round" }, "yellow", "")}</div>
      <div class="eyebrow">Order confirmed</div>
      <h1 class="display">Thank you, ${esc(order.customer.first)}.</h1>
      <p>Your piece is now being hand-set just for you. A confirmation will be sent to <b>${esc(order.customer.email)}</b>, and you'll get tracking as soon as it ships.</p>
      <div class="order-no">${esc(order.orderNumber)}</div>
      ${order.payment.method === "demo" ? `<p class="fineprint">Demo mode — no payment was taken.</p>` : ""}
      <br><br><a class="btn btn-ghost" href="index.html">Continue shopping</a>
    </div>`;
    Cart.clear();
  }

  /* ---------- Payment ---------- */
  function renderPayment() {
    if (!cfg.paypalClientId) return renderDemoPay();

    $("#pay-area").innerHTML = `<div id="paypal-buttons"></div><p class="fineprint">Pay with PayPal, Venmo, Pay Later, or any debit/credit card — no PayPal account required.</p>`;
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(cfg.paypalClientId)}&currency=${encodeURIComponent(cfg.currency)}&intent=capture&enable-funding=venmo,paylater`;
    s.onload = mountPayPal;
    s.onerror = () => showPayError("Couldn't load the payment provider. Please refresh and try again.");
    document.head.appendChild(s);
  }

  function mountPayPal() {
    window.paypal
      .Buttons({
        style: { shape: "pill", color: "gold", layout: "vertical", label: "pay" },
        onClick: (_data, actions) => (validate() ? actions.resolve() : actions.reject()),
        createOrder: (_data, actions) => {
          const t = totals();
          const c = readForm();
          const cur = cfg.currency;
          return actions.order.create({
            purchase_units: [
              {
                description: `${cfg.brand} order`,
                amount: {
                  currency_code: cur,
                  value: dollars(t.total),
                  breakdown: {
                    item_total: { currency_code: cur, value: dollars(t.subtotal) },
                    shipping: { currency_code: cur, value: dollars(t.ship) },
                    discount: { currency_code: cur, value: dollars(t.discount) },
                  },
                },
                items: t.lines.map((l) => {
                  const p = product(l.id);
                  return {
                    name: p.name.slice(0, 127),
                    sku: p.id,
                    description: Cart.describe(l).slice(0, 127),
                    quantity: String(l.qty),
                    unit_amount: { currency_code: cur, value: dollars(cents(unitPrice(p, l.metal))) },
                  };
                }),
                shipping: {
                  name: { full_name: `${c.first} ${c.last}`.slice(0, 300) },
                  address: {
                    address_line_1: c.address1,
                    address_line_2: c.address2 || undefined,
                    admin_area_2: c.city,
                    admin_area_1: c.region,
                    postal_code: c.postal,
                    country_code: c.country,
                  },
                },
              },
            ],
            application_context: { shipping_preference: "SET_PROVIDED_ADDRESS" },
          });
        },
        onApprove: async (_data, actions) => {
          const capture = await actions.order.capture();
          await finish(buildOrder({ method: "paypal", paypalOrderId: capture.id, status: capture.status }));
        },
        onError: () => showPayError("Your payment couldn't be completed. Please try again or use another method."),
      })
      .render("#paypal-buttons");
  }

  function renderDemoPay() {
    $("#pay-area").innerHTML = `
      <div class="demo-note"><b>Demo mode.</b> Payments aren't connected yet, so no card will be charged. Add your PayPal Client ID in <code>js/config.js</code> to go live.</div>
      <button type="button" class="btn btn-gold btn-block" id="demo-pay">Place test order</button>`;
    $("#demo-pay").addEventListener("click", async (e) => {
      if (!validate()) return;
      e.currentTarget.disabled = true;
      await finish(buildOrder({ method: "demo" }));
    });
  }

  /* ---------- Boot ---------- */
  if (!Cart.lines().length) renderEmpty();
  else renderCheckout();

  document.addEventListener("cart:change", () => {
    if (!$("#form")) return;
    if (!Cart.lines().length) renderEmpty();
    else renderSummary();
  });
})();
