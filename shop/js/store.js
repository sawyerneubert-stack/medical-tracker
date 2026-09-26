/* Storefront page: starfield, product grid, quick-view modal, cart drawer. */
(function () {
  const { esc, money, product, metal, unitPrice, lineKey, Cart, cfg } = window.Shop;
  const $ = (s, el = document) => el.querySelector(s);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const artFor = (p, toneId = "white") =>
    p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : window.renderPiece(p.art, toneId, p.name);

  /* ---------- Branding / static text ---------- */
  document.querySelectorAll("[data-brand]").forEach((el) => (el.textContent = cfg.brand));
  document.title = `${cfg.brand} — Moissanite Fine Jewelry`;
  $("#footer-tagline").textContent = cfg.tagline;
  $("#year").textContent = new Date().getFullYear();
  $("#support-link").href = "mailto:" + cfg.supportEmail;
  const ann = cfg.announcement.map((t) => `<span>${esc(t)}</span>`).join("");
  $("#announce").innerHTML = ann + ann + ann + ann; // duplicated for a seamless loop

  $("#hero-art").insertAdjacentHTML(
    "beforeend",
    window.renderPiece({ type: "ring", style: "halo", shape: "round" }, "yellow", "Moissanite halo ring")
  );

  /* ---------- Starfield ---------- */
  (function sky() {
    const canvas = $("#sky");
    const ctx = canvas.getContext("2d");
    let w, h, stars = [], meteor = null, running = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 5200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        p: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.6,
        hue: Math.random() < 0.15 ? 40 : 220,
      }));
      if (reduceMotion) draw(0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * 0.7, h * 0.4, 0, w * 0.7, h * 0.4, Math.max(w, h) * 0.7);
      g.addColorStop(0, "rgba(40,46,92,.55)");
      g.addColorStop(1, "rgba(10,12,22,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (const s of stars) {
        const a = 0.35 + 0.65 * Math.abs(Math.sin(s.p + t * 0.0006 * s.s));
        ctx.fillStyle = `hsla(${s.hue}, 70%, 88%, ${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!meteor && Math.random() < 0.004) {
        meteor = { x: Math.random() * w * 0.8 + w * 0.2, y: Math.random() * h * 0.3, life: 1 };
      }
      if (meteor) {
        const len = 140;
        const grad = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x + len, meteor.y - len * 0.45);
        grad.addColorStop(0, `rgba(255,240,210,${meteor.life})`);
        grad.addColorStop(1, "rgba(255,240,210,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x + len, meteor.y - len * 0.45);
        ctx.stroke();
        meteor.x -= 9;
        meteor.y += 4;
        meteor.life -= 0.015;
        if (meteor.life <= 0) meteor = null;
      }
    }

    function loop(t) {
      if (!running) return;
      draw(t);
      requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    resize();
    if (!reduceMotion) {
      new IntersectionObserver(([e]) => {
        const was = running;
        running = e.isIntersecting;
        if (running && !was) requestAnimationFrame(loop);
      }).observe(canvas);
      requestAnimationFrame(loop);
    }
  })();

  /* ---------- Product grid ---------- */
  let activeCat = "all";
  const chips = $("#chips");
  chips.innerHTML = window.CATEGORIES.map(
    (c) => `<button class="chip" data-cat="${c.id}" aria-pressed="${c.id === "all"}">${esc(c.label)}</button>`
  ).join("");

  function setCategory(cat) {
    activeCat = cat;
    chips.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.cat === cat));
    renderGrid();
  }
  chips.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (b) setCategory(b.dataset.cat);
  });
  document.querySelectorAll("footer [data-cat]").forEach((a) =>
    a.addEventListener("click", () => setCategory(a.dataset.cat))
  );
  $("#sort").addEventListener("change", renderGrid);

  function renderGrid() {
    let list = window.PRODUCTS.filter((p) => activeCat === "all" || p.category === activeCat);
    const sort = $("#sort").value;
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);

    $("#grid").innerHTML = list
      .map((p) => {
        const isRing = p.category === "rings";
        return `<article class="card">
          ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
          <button class="card-art" data-view="${esc(p.id)}" aria-label="View ${esc(p.name)}">${artFor(p)}</button>
          <div class="card-body">
            <div class="card-top"><h3>${esc(p.name)}</h3><span class="carat">${esc(p.carat)}</span></div>
            <div class="price">from ${money(p.price)}${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ""}</div>
            <div class="tone-dots" aria-label="Available in white, yellow and rose">
              <span class="tone-dot tone-white"></span><span class="tone-dot tone-yellow"></span><span class="tone-dot tone-rose"></span>
            </div>
            <div class="card-actions">
              <button class="btn btn-ghost" data-view="${esc(p.id)}">View</button>
              ${
                isRing
                  ? `<button class="btn btn-gold" data-view="${esc(p.id)}">Choose size</button>`
                  : `<button class="btn btn-gold" data-quick="${esc(p.id)}">Add to bag</button>`
              }
            </div>
          </div>
        </article>`;
      })
      .join("");
  }

  $("#grid").addEventListener("click", (e) => {
    const view = e.target.closest("[data-view]");
    const quick = e.target.closest("[data-quick]");
    if (view) openModal(view.dataset.view);
    if (quick) {
      Cart.add({ id: quick.dataset.quick, metal: "s925", tone: "white", size: null, qty: 1 });
      toast(`${product(quick.dataset.quick).name} added to your bag`);
    }
  });

  /* ---------- Quick-view modal ---------- */
  const modal = $("#modal");

  function openModal(id) {
    const p = product(id);
    if (!p) return;
    const isRing = p.category === "rings";
    const state = { metal: "s925", tone: "white", size: null };

    modal.innerHTML = `
      <button class="icon-btn close" aria-label="Close">✕</button>
      <div class="modal-grid">
        <div class="modal-art" id="m-art">${artFor(p, state.tone)}</div>
        <div class="modal-info">
          <div class="eyebrow">${esc(p.carat)} · Moissanite</div>
          <h2 class="display" id="modal-title">${esc(p.name)}</h2>
          <div class="price" id="m-price"></div>
          <p>${esc(p.blurb)}</p>
          <div>
            <span class="opt-label">Metal</span>
            <div class="opt-row" id="m-metal">${window.METALS.map(
              (m) => `<button class="opt" data-metal="${m.id}">${esc(m.label)}${m.add ? `<small>+${money(m.add)}</small>` : ""}</button>`
            ).join("")}</div>
          </div>
          <div>
            <span class="opt-label">Tone</span>
            <div class="opt-row" id="m-tone">${window.TONES.map(
              (t) => `<button class="opt" data-tone="${t.id}"><span class="tone-dot tone-${t.id}"></span>${esc(t.label)}</button>`
            ).join("")}</div>
          </div>
          ${
            isRing
              ? `<div><label class="opt-label" for="m-size">Ring size (US)</label>
                 <select class="select" id="m-size" style="width:100%"><option value="">Select your size</option>${window.RING_SIZES.map(
                   (s) => `<option>${s}</option>`
                 ).join("")}</select><div class="field-error" id="m-size-err" hidden>Please choose a ring size.</div></div>`
              : ""
          }
          <button class="btn btn-gold btn-block" id="m-add">Add to bag</button>
          <ul class="details-list">${p.details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
        </div>
      </div>`;

    function sync() {
      modal.querySelectorAll("[data-metal]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.metal === state.metal));
      modal.querySelectorAll("[data-tone]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.tone === state.tone));
      const price = unitPrice(p, state.metal);
      const compare = p.compareAt ? p.compareAt + metal(state.metal).add : null;
      $("#m-price", modal).innerHTML = money(price) + (compare ? `<s>${money(compare)}</s>` : "");
    }

    modal.onclick = (e) => {
      if (e.target === modal || e.target.closest(".close")) return modal.close();
      const m = e.target.closest("[data-metal]");
      const t = e.target.closest("[data-tone]");
      if (m) state.metal = m.dataset.metal;
      if (t) {
        state.tone = t.dataset.tone;
        $("#m-art", modal).innerHTML = artFor(p, state.tone);
      }
      if (m || t) sync();
      if (e.target.closest("#m-add")) {
        if (isRing) {
          state.size = $("#m-size", modal).value || null;
          if (!state.size) {
            $("#m-size-err", modal).hidden = false;
            $("#m-size", modal).focus();
            return;
          }
        }
        Cart.add({ id: p.id, ...state, qty: 1 });
        modal.close();
        openDrawer();
      }
    };
    const sizeSel = $("#m-size", modal);
    if (sizeSel) sizeSel.onchange = () => ($("#m-size-err", modal).hidden = true);

    sync();
    modal.showModal();
  }

  /* ---------- Cart drawer ---------- */
  const drawer = $("#drawer");
  const scrim = $("#scrim");
  let lastFocus = null;

  function openDrawer() {
    lastFocus = document.activeElement;
    renderDrawer();
    drawer.classList.add("open");
    scrim.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    $("#close-cart").focus();
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    scrim.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    if (lastFocus) lastFocus.focus();
  }
  $("#open-cart").addEventListener("click", openDrawer);
  $("#close-cart").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
  });

  function renderDrawer() {
    const lines = Cart.lines();
    $("#drawer-foot").hidden = !lines.length;
    if (!lines.length) {
      $("#drawer-body").innerHTML = `<div class="empty"><div class="display">Your bag is empty</div><p>Every stone is a star waiting to be worn.</p><br><a href="#shop" class="btn btn-ghost" id="empty-shop">Browse the collection</a></div>`;
      $("#empty-shop").onclick = closeDrawer;
      return;
    }
    $("#drawer-body").innerHTML = lines
      .map((l) => {
        const p = product(l.id);
        const key = esc(lineKey(l));
        return `<div class="line">
          <div class="line-art">${artFor(p, l.tone)}</div>
          <div>
            <h4>${esc(p.name)}</h4>
            <small>${esc(Cart.describe(l))}</small>
            <div class="qty"><button data-dec="${key}" aria-label="Decrease quantity">−</button><span>${l.qty}</span><button data-inc="${key}" aria-label="Increase quantity">+</button></div>
            <button class="remove" data-remove="${key}">Remove</button>
          </div>
          <div class="line-price">${money(unitPrice(p, l.metal) * l.qty)}</div>
        </div>`;
      })
      .join("");
    $("#drawer-subtotal").textContent = money(Cart.subtotal());
  }

  $("#drawer-body").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const lines = Cart.lines();
    const find = (k) => lines.find((l) => lineKey(l) === k);
    if (b.dataset.inc) Cart.setQty(b.dataset.inc, Math.min(10, find(b.dataset.inc).qty + 1));
    if (b.dataset.dec) Cart.setQty(b.dataset.dec, find(b.dataset.dec).qty - 1);
    if (b.dataset.remove) Cart.remove(b.dataset.remove);
  });

  function updateCount() {
    const el = $("#cart-count");
    el.textContent = Cart.count();
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }
  document.addEventListener("cart:change", () => {
    updateCount();
    if (drawer.classList.contains("open")) renderDrawer();
  });
  window.addEventListener("storage", () => document.dispatchEvent(new CustomEvent("cart:change")));

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
  }

  /* ---------- Savings calculator ---------- */
  const round10 = (n) => Math.round(n / 10) * 10;
  function calc() {
    const ct = parseFloat($("#carat").value);
    const diamond = round10(5200 * Math.pow(ct, 1.9));
    const moiss = round10(460 + 290 * Math.pow(ct, 1.4));
    $("#carat-out").textContent = ct.toFixed(2).replace(/0$/, "") + " ct";
    $("#dia-price").textContent = money(diamond);
    $("#moi-price").textContent = money(moiss);
    $("#save").textContent = money(diamond - moiss);
  }
  $("#carat").addEventListener("input", calc);

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  renderGrid();
  calc();
  $("#cart-count").textContent = Cart.count();
})();
