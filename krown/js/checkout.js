/*
 * Checkout. With `paypalClientId` set in config.js, payment runs through
 * PayPal's hosted buttons (PayPal, Venmo, Pay Later, debit/credit card), so
 * card details never touch this site. Without it, the page runs in demo mode.
 */
(function () {
  const { $, esc, money, product, Cart, cfg, optionText } = window.K;
  const root = $("#checkout-root");
  const dollars = (c) => (c / 100).toFixed(2);
  const state = { shipping: cfg.shipping[0].id };

  const COUNTRIES = [
    ["US", "United States"], ["CA", "Canada"], ["GB", "United Kingdom"], ["AU", "Australia"],
    ["IE", "Ireland"], ["NZ", "New Zealand"], ["DE", "Germany"], ["FR", "France"], ["NL", "Netherlands"],
  ];

  if (!Cart.lines().length) {
    root.innerHTML = `<div class="empty-state"><h1>Your cart is empty</h1><p>Add a watch you love, then come back to check out.</p><a class="btn" href="shop.html">Shop Now</a></div>`;
    return;
  }

  const field = (id, label, { type = "text", auto = "", full = false, optional = false } = {}) =>
    `<div class="field${full ? " full" : ""}"><label for="${id}">${label}${optional ? " (optional)" : ""}</label>
     <input id="${id}" name="${id}" type="${type}" autocomplete="${auto}" ${optional ? "" : "required"}></div>`;

  root.innerHTML = `
    <div class="checkout-layout">
      <form id="form" novalidate>
        <div class="form-section">
          <h2>Contact Information</h2>
          <div class="fields">
            ${field("email", "Email", { type: "email", auto: "email", full: true })}
            ${field("phone", "Phone", { type: "tel", auto: "tel", full: true, optional: true })}
          </div>
        </div>
        <div class="form-section">
          <h2>Shipping Address</h2>
          <div class="fields">
            ${field("first", "First name", { auto: "given-name" })}
            ${field("last", "Last name", { auto: "family-name" })}
            ${field("address1", "Address", { auto: "address-line1", full: true })}
            ${field("address2", "Apartment, suite, etc.", { auto: "address-line2", full: true, optional: true })}
            ${field("city", "City", { auto: "address-level2" })}
            ${field("region", "State / Province", { auto: "address-level1" })}
            ${field("postal", "ZIP / Postal code", { auto: "postal-code" })}
            <div class="field"><label for="country">Country</label>
              <select id="country" autocomplete="country" required>${COUNTRIES.map(([c, n]) => `<option value="${c}">${n}</option>`).join("")}</select></div>
          </div>
        </div>
        <div class="form-section">
          <h2>Shipping Method</h2>
          <div class="ship-opts" id="ship-opts"></div>
        </div>
        <div class="form-section">
          <h2>Payment</h2>
          <div class="pay-box">
            <div class="pay-error" id="pay-error" role="alert" hidden></div>
            <div id="pay-area"></div>
          </div>
        </div>
      </form>
      <aside class="order-summary" aria-label="Order summary">
        <h2>Order Summary</h2>
        <div id="os-lines"></div>
        <div class="sums" id="os-sums"></div>
      </aside>
    </div>`;

  function renderShipping() {
    const t = Cart.totals("standard");
    $("#ship-opts").innerHTML = cfg.shipping
      .map((s) => {
        const free = s.id === "standard" && t.subtotal >= cfg.freeShippingOver * 100;
        return `<label class="ship-opt"><input type="radio" name="shipping" value="${esc(s.id)}" ${s.id === state.shipping ? "checked" : ""}>
          <div>${esc(s.label)}<small>${esc(s.eta)}</small></div><b>${free ? "Free" : money(s.price)}</b></label>`;
      })
      .join("");
  }

  function renderSummary() {
    const t = Cart.totals(state.shipping);
    $("#os-lines").innerHTML = t.lines
      .map((l) => {
        const p = product(l.id);
        return `<div class="os-line"><div class="os-thumb"><img src="${esc(p.images[0])}" alt="" width="64" height="64"><i>${l.qty}</i></div>
          <div>${esc(p.name)}${l.size ? `<small>${esc(optionText(p, l.size))}</small>` : ""}</div><div>${money(p.price * l.qty)}</div></div>`;
      })
      .join("");
    $("#os-sums").innerHTML = `
      <div class="sum-row"><span>Subtotal</span><span>${money(t.subtotal / 100)}</span></div>
      <div class="sum-row"><span>Shipping</span><span>${t.shipping ? money(t.shipping / 100) : "Free"}</span></div>
      <div class="sum-row total"><span>Total</span><span>${money(t.total / 100)}</span></div>`;
  }

  const form = $("#form");
  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("change", (e) => {
    if (e.target.name === "shipping") {
      state.shipping = e.target.value;
      renderSummary();
    }
  });
  form.addEventListener("input", (e) => {
    const f = e.target.closest(".field");
    if (f) f.classList.remove("invalid");
    if (!form.querySelector(".field.invalid")) showError("");
  });

  function readForm() {
    const v = (id) => $("#" + id).value.trim();
    return {
      email: v("email"), phone: v("phone"), first: v("first"), last: v("last"),
      address1: v("address1"), address2: v("address2"), city: v("city"),
      region: v("region"), postal: v("postal"), country: v("country"),
    };
  }

  function validate() {
    let first = null;
    form.querySelectorAll("[required]").forEach((el) => {
      const val = el.value.trim();
      const ok = !!val && (el.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
      el.closest(".field").classList.toggle("invalid", !ok);
      if (!ok && !first) first = el;
    });
    if (first) {
      first.focus();
      showError("Please complete the highlighted fields.");
      return false;
    }
    showError("");
    return true;
  }

  function showError(msg) {
    const el = $("#pay-error");
    el.textContent = msg;
    el.hidden = !msg;
  }

  function buildOrder(payment) {
    const t = Cart.totals(state.shipping);
    return {
      orderNumber: "KR" + Date.now().toString().slice(-7) + Math.floor(Math.random() * 90 + 10),
      createdAt: new Date().toISOString(),
      customer: readForm(),
      shippingMethod: (cfg.shipping.find((s) => s.id === state.shipping) || cfg.shipping[0]).label,
      items: t.lines.map((l) => {
        const p = product(l.id);
        return { sku: p.id, name: p.name, option: optionText(p, l.size), qty: l.qty, price: p.price.toFixed(2), image: p.images[0] };
      }),
      subtotal: dollars(t.subtotal),
      shipping: dollars(t.shipping),
      total: dollars(t.total),
      currency: cfg.currency,
      payment,
    };
  }

  async function complete(payment) {
    const order = buildOrder(payment);
    if (cfg.orderWebhook) {
      await fetch(cfg.orderWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(order),
        keepalive: true,
      }).catch(() => {});
    }
    try {
      sessionStorage.setItem("krown_last_order", JSON.stringify(order));
    } catch (e) {
      /* confirmation page will show a generic message */
    }
    Cart.clear();
    location.href = "confirmation.html";
  }

  /* ---------- Payment ---------- */
  function renderDemo() {
    $("#pay-area").innerHTML = `
      <div class="demo-note"><b>Demo mode:</b> payments aren't connected yet, so no charge will be made. Add your PayPal Client ID in <code>js/config.js</code> to accept real payments.</div>
      <button type="button" class="btn btn-block" id="place-order">Place Order</button>`;
    $("#place-order").addEventListener("click", (e) => {
      if (!validate()) return;
      e.currentTarget.disabled = true;
      e.currentTarget.textContent = "Placing order…";
      complete({ method: "demo" });
    });
  }

  function renderPayPal() {
    $("#pay-area").innerHTML = `<div id="paypal-buttons"></div><p class="secure-note">Pay with card, PayPal, Venmo or Pay Later. Your payment details are handled securely by PayPal and never stored on our site.</p>`;
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(cfg.paypalClientId)}&currency=${encodeURIComponent(cfg.currency)}&intent=capture&enable-funding=venmo,paylater`;
    s.onerror = () => showError("We couldn't load the payment form. Please refresh the page and try again.");
    s.onload = () =>
      window.paypal
        .Buttons({
          style: { layout: "vertical", color: "black", shape: "rect", label: "pay" },
          onClick: (_d, actions) => (validate() ? actions.resolve() : actions.reject()),
          createOrder: (_d, actions) => {
            const t = Cart.totals(state.shipping);
            const c = readForm();
            const cur = cfg.currency;
            return actions.order.create({
              purchase_units: [{
                description: "KROWN Watches order",
                amount: {
                  currency_code: cur,
                  value: dollars(t.total),
                  breakdown: {
                    item_total: { currency_code: cur, value: dollars(t.subtotal) },
                    shipping: { currency_code: cur, value: dollars(t.shipping) },
                  },
                },
                items: t.lines.map((l) => {
                  const p = product(l.id);
                  return {
                    name: p.name,
                    sku: p.id,
                    description: l.size ? optionText(p, l.size).slice(0, 127) : undefined,
                    quantity: String(l.qty),
                    unit_amount: { currency_code: cur, value: p.price.toFixed(2) },
                  };
                }),
                shipping: {
                  name: { full_name: `${c.first} ${c.last}` },
                  address: {
                    address_line_1: c.address1,
                    address_line_2: c.address2 || undefined,
                    admin_area_2: c.city,
                    admin_area_1: c.region,
                    postal_code: c.postal,
                    country_code: c.country,
                  },
                },
              }],
              application_context: { shipping_preference: "SET_PROVIDED_ADDRESS", brand_name: "KROWN Watches" },
            });
          },
          onApprove: async (_d, actions) => {
            const capture = await actions.order.capture();
            await complete({ method: "paypal", paypalOrderId: capture.id, status: capture.status });
          },
          onError: () => showError("Your payment couldn't be completed. Please try again or use a different payment method."),
        })
        .render("#paypal-buttons");
    document.head.appendChild(s);
  }

  renderShipping();
  renderSummary();
  cfg.paypalClientId ? renderPayPal() : renderDemo();
})();
