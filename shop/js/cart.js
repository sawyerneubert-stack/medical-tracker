/*
 * Shared helpers + cart state (persisted in localStorage).
 * Prices are always recomputed from the catalog, never trusted from storage.
 */
(function () {
  const KEY = "astraea_cart_v1";
  let memory = [];
  const cfg = window.STORE_CONFIG;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: cfg.currency });
  const money = (n) => fmt.format(n);

  const product = (id) => window.PRODUCTS.find((p) => p.id === id);
  const metal = (id) => window.METALS.find((m) => m.id === id) || window.METALS[0];
  const tone = (id) => window.TONES.find((t) => t.id === id) || window.TONES[0];

  const unitPrice = (p, metalId) => p.price + metal(metalId).add;
  const lineKey = (l) => [l.id, l.metal, l.tone, l.size || ""].join("|");

  function read() {
    let raw = [];
    try {
      raw = JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      raw = memory;
    }
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((l) => l && product(l.id))
      .map((l) => ({
        id: l.id,
        metal: metal(l.metal).id,
        tone: tone(l.tone).id,
        size: product(l.id).category === "rings" && window.RING_SIZES.includes(l.size) ? l.size : null,
        qty: Math.min(10, Math.max(1, parseInt(l.qty, 10) || 1)),
      }));
  }

  function write(lines) {
    memory = lines;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch (e) {
      /* storage unavailable — keep in memory for this page view */
    }
    document.dispatchEvent(new CustomEvent("cart:change"));
  }

  const Cart = {
    lines: read,
    add(line) {
      const lines = read();
      const existing = lines.find((l) => lineKey(l) === lineKey(line));
      if (existing) existing.qty = Math.min(10, existing.qty + (line.qty || 1));
      else lines.push({ ...line, qty: line.qty || 1 });
      write(lines);
    },
    setQty(key, qty) {
      const lines = read()
        .map((l) => (lineKey(l) === key ? { ...l, qty } : l))
        .filter((l) => l.qty > 0);
      write(lines);
    },
    remove(key) {
      write(read().filter((l) => lineKey(l) !== key));
    },
    clear() {
      write([]);
    },
    count() {
      return read().reduce((n, l) => n + l.qty, 0);
    },
    subtotal() {
      return read().reduce((n, l) => n + unitPrice(product(l.id), l.metal) * l.qty, 0);
    },
    describe(l) {
      const parts = [metal(l.metal).label, tone(l.tone).label + " tone"];
      if (l.size) parts.push("Size " + l.size);
      return parts.join(" · ");
    },
  };

  window.Shop = { esc, money, product, metal, tone, unitPrice, lineKey, Cart, cfg };
})();
