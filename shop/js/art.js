/*
 * Procedural SVG renderings of each piece, so the shop looks finished before
 * you have product photography. Set `image` on a product in catalog.js to use
 * a real photo instead.
 */
(function () {
  let uid = 0;

  const METAL_STOPS = {
    white: ["#fbfcfd", "#c9ced6", "#8e96a3", "#e9ecf0"],
    yellow: ["#fff3c9", "#e7c36c", "#a87a26", "#f4dc97"],
    rose: ["#ffe3d8", "#e7a58f", "#a4604d", "#f5c6b5"],
  };

  const f = (n) => Math.round(n * 100) / 100;

  function defs(id, tone) {
    const m = METAL_STOPS[tone] || METAL_STOPS.white;
    return `<defs>
      <linearGradient id="m${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${m[0]}"/><stop offset=".35" stop-color="${m[1]}"/>
        <stop offset=".7" stop-color="${m[2]}"/><stop offset="1" stop-color="${m[3]}"/>
      </linearGradient>
      <radialGradient id="g${id}" cx=".38" cy=".32" r=".8">
        <stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#eef3fb"/>
        <stop offset=".8" stop-color="#b9c6d9"/><stop offset="1" stop-color="#8d9bb2"/>
      </radialGradient>
    </defs>`;
  }

  function sparkle(x, y, s, delay) {
    const a = s * 0.2;
    return `<path class="twinkle" style="animation-delay:${delay}s" fill="#fff" d="M${f(x)} ${f(y - s)}L${f(x + a)} ${f(y - a)}L${f(x + s)} ${f(y)}L${f(x + a)} ${f(y + a)}L${f(x)} ${f(y + s)}L${f(x - a)} ${f(y + a)}L${f(x - s)} ${f(y)}L${f(x - a)} ${f(y - a)}Z"/>`;
  }

  // Coloured "fire" flecks — moissanite's signature rainbow flashes.
  function fire(cx, cy, s) {
    const hues = [8, 48, 140, 200, 280];
    return hues
      .map((h, i) => {
        const ang = (i / hues.length) * Math.PI * 2 + 0.6;
        const x = cx + Math.cos(ang) * s * 0.42;
        const y = cy + Math.sin(ang) * s * 0.42;
        const t = s * 0.16;
        return `<path fill="hsl(${h} 95% 62%)" opacity=".55" d="M${f(x)} ${f(y - t)}L${f(x + t)} ${f(y + t * 0.7)}L${f(x - t)} ${f(y + t * 0.7)}Z"/>`;
      })
      .join("");
  }

  function gem(cx, cy, s, shape, id, opts = {}) {
    const fill = `url(#g${id})`;
    const facet = `stroke="rgba(70,88,120,.38)" stroke-width="${f(Math.max(0.4, s * 0.03))}" fill="none"`;
    let body = "";
    let facets = "";

    if (shape === "oval") {
      body = `<ellipse cx="${cx}" cy="${cy}" rx="${f(s * 0.74)}" ry="${f(s)}" fill="${fill}"/>`;
      facets = `<ellipse cx="${cx}" cy="${cy}" rx="${f(s * 0.4)}" ry="${f(s * 0.55)}" ${facet}/>
        <path ${facet} d="M${cx} ${f(cy - s)}L${cx} ${f(cy - s * 0.55)}M${cx} ${f(cy + s)}L${cx} ${f(cy + s * 0.55)}M${f(cx - s * 0.74)} ${cy}L${f(cx - s * 0.4)} ${cy}M${f(cx + s * 0.74)} ${cy}L${f(cx + s * 0.4)} ${cy}"/>`;
    } else if (shape === "emerald") {
      const w = s * 0.72, h = s, c = s * 0.24;
      const oct = (W, H, C) =>
        `M${f(cx - W + C)} ${f(cy - H)}H${f(cx + W - C)}L${f(cx + W)} ${f(cy - H + C)}V${f(cy + H - C)}L${f(cx + W - C)} ${f(cy + H)}H${f(cx - W + C)}L${f(cx - W)} ${f(cy + H - C)}V${f(cy - H + C)}Z`;
      body = `<path fill="${fill}" d="${oct(w, h, c)}"/>`;
      facets = `<path ${facet} d="${oct(w * 0.72, h * 0.8, c * 0.7)}"/><path ${facet} d="${oct(w * 0.44, h * 0.6, c * 0.4)}"/>`;
    } else if (shape === "pear") {
      const d = `M${cx} ${f(cy - s * 1.25)}C${f(cx + s * 0.3)} ${f(cy - s * 0.85)} ${f(cx + s * 0.82)} ${f(cy - s * 0.35)} ${f(cx + s * 0.82)} ${f(cy + s * 0.2)}A${f(s * 0.82)} ${f(s * 0.82)} 0 0 1 ${f(cx - s * 0.82)} ${f(cy + s * 0.2)}C${f(cx - s * 0.82)} ${f(cy - s * 0.35)} ${f(cx - s * 0.3)} ${f(cy - s * 0.85)} ${cx} ${f(cy - s * 1.25)}Z`;
      body = `<path fill="${fill}" d="${d}"/>`;
      facets = `<ellipse cx="${cx}" cy="${f(cy + s * 0.15)}" rx="${f(s * 0.4)}" ry="${f(s * 0.46)}" ${facet}/>
        <path ${facet} d="M${cx} ${f(cy - s * 1.25)}L${cx} ${f(cy - s * 0.31)}M${f(cx - s * 0.82)} ${f(cy + s * 0.2)}L${f(cx - s * 0.4)} ${f(cy + s * 0.15)}M${f(cx + s * 0.82)} ${f(cy + s * 0.2)}L${f(cx + s * 0.4)} ${f(cy + s * 0.15)}"/>`;
    } else {
      body = `<circle cx="${cx}" cy="${cy}" r="${s}" fill="${fill}"/>`;
      if (s > 5) {
        const pts = [];
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          pts.push([cx + Math.cos(a) * s * 0.5, cy + Math.sin(a) * s * 0.5, cx + Math.cos(a) * s, cy + Math.sin(a) * s]);
        }
        facets = `<path ${facet} d="${pts.map((p, i) => (i ? "L" : "M") + f(p[0]) + " " + f(p[1])).join("")}Z${pts.map((p) => `M${f(p[0])} ${f(p[1])}L${f(p[2])} ${f(p[3])}`).join("")}"/>`;
      }
    }

    const outline = `stroke="url(#m${id})" stroke-width="${f(Math.max(0.6, s * 0.06))}"`;
    const bodyOutlined = body.replace("/>", ` ${outline}/>`);
    const withFire = s > 7 && !opts.noFire ? fire(cx, cy, s) : "";
    return `<g>${bodyOutlined}${facets}${withFire}</g>`;
  }

  function prongs(cx, cy, s, id, n = 4) {
    let out = "";
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (n === 4 ? Math.PI / 4 : Math.PI / 6);
      out += `<circle cx="${f(cx + Math.cos(a) * s * 0.93)}" cy="${f(cy + Math.sin(a) * s * 0.93)}" r="${f(Math.max(1.2, s * 0.11))}" fill="url(#m${id})"/>`;
    }
    return out;
  }

  function ring(style, shape, id) {
    const bx = 100, by = 124, br = 50;
    let out = `<ellipse cx="100" cy="186" rx="58" ry="6" fill="rgba(0,0,0,.28)"/>`;
    const bandW = style === "pave" || style === "eternity" ? 7 : 8;
    out += `<circle cx="${bx}" cy="${by}" r="${br}" fill="none" stroke="url(#m${id})" stroke-width="${bandW}"/>`;
    out += `<circle cx="${bx}" cy="${by}" r="${br - bandW / 2}" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1"/>`;

    if (style === "eternity" || style === "pave") {
      const from = style === "eternity" ? 0 : 200;
      const to = style === "eternity" ? 360 : 340;
      const step = style === "eternity" ? 18 : 10;
      const r = style === "eternity" ? 4.4 : 2.6;
      for (let d = from; d < to + 0.1 && !(style === "eternity" && d === 360); d += step) {
        const a = (d * Math.PI) / 180;
        out += gem(f(bx + Math.cos(a) * br), f(by + Math.sin(a) * br), r, "round", id, { noFire: true });
      }
      out += sparkle(bx - 30, by - 44, 8, 0.2) + sparkle(bx + 44, by - 10, 6, 1.1);
      return out;
    }

    const cy = 64;
    // cathedral shoulders
    out += `<path d="M70 84Q88 76 100 ${cy + 16}Q112 76 130 84" fill="none" stroke="url(#m${id})" stroke-width="4" stroke-linecap="round"/>`;
    out += `<path d="M88 ${cy + 18}L94 ${cy + 4}M112 ${cy + 18}L106 ${cy + 4}" stroke="url(#m${id})" stroke-width="3" stroke-linecap="round"/>`;

    if (style === "threestone") {
      out += gem(70, 76, 10, shape, id) + gem(130, 76, 10, shape, id);
      out += gem(100, cy - 2, 21, shape, id);
      out += sparkle(118, 38, 9, 0.3) + sparkle(64, 62, 6, 1.4);
      return out;
    }
    if (style === "halo") {
      const hr = 24;
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        out += `<circle cx="${f(100 + Math.cos(a) * hr)}" cy="${f(cy + Math.sin(a) * hr)}" r="3.3" fill="url(#g${id})" stroke="url(#m${id})" stroke-width=".8"/>`;
      }
      out += gem(100, cy, 18, shape, id) + prongs(100, cy, 18, id);
      out += sparkle(126, 36, 10, 0) + sparkle(72, 80, 6, 0.9);
      return out;
    }
    const s = shape === "round" ? 22 : 21;
    const gy = shape === "pear" ? cy + 2 : cy - 4;
    out += gem(100, gy, s, shape, id) + (shape === "round" ? prongs(100, gy, s, id, 6) : prongs(100, gy, s * 0.95, id));
    out += sparkle(124, 36, 10, 0.1) + sparkle(76, 50, 6, 1.2);
    return out;
  }

  function studs(shape, id) {
    let out = "";
    [[62, 102], [138, 102]].forEach(([x, y], i) => {
      out += `<ellipse cx="${x}" cy="${y + 34}" rx="22" ry="4" fill="rgba(0,0,0,.25)"/>`;
      out += gem(x, y, 26, shape, id) + prongs(x, y, 26, id);
      out += sparkle(x + 18, y - 22, 9, i * 0.8);
    });
    return out;
  }

  function hoops(id) {
    let out = "";
    [[64, 100], [136, 100]].forEach(([x, y], i) => {
      out += `<circle cx="${x}" cy="${y}" r="32" fill="none" stroke="url(#m${id})" stroke-width="8"/>`;
      for (let d = 20; d <= 160; d += 20) {
        const a = (d * Math.PI) / 180;
        out += gem(f(x + Math.cos(a) * 32), f(y + Math.sin(a) * 32), 3.4, "round", id, { noFire: true });
      }
      out += sparkle(x + 22, y + 34, 7, i * 0.9);
    });
    return out;
  }

  function pendant(shape, id) {
    let out = `<path d="M24 0Q58 76 100 118M176 0Q142 76 100 118" fill="none" stroke="url(#m${id})" stroke-width="1.8" stroke-dasharray="2.4 1.4"/>`;
    out += `<ellipse cx="100" cy="124" rx="3.4" ry="7" fill="none" stroke="url(#m${id})" stroke-width="2.4"/>`;
    const gy = shape === "pear" ? 160 : 152;
    out += gem(100, gy, 20, shape, id) + (shape === "pear" ? "" : prongs(100, gy, 20, id));
    out += sparkle(122, 138, 9, 0.4) + sparkle(78, 170, 5, 1.3);
    return out;
  }

  function tennis(id) {
    let out = `<ellipse cx="100" cy="176" rx="74" ry="7" fill="rgba(0,0,0,.25)"/>`;
    const cx = 100, cy = 72, rx = 78, ry = 84, n = 17;
    for (let i = 0; i < n; i++) {
      const a = ((8 + (i / (n - 1)) * 164) * Math.PI) / 180;
      const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
      out += `<rect x="${f(x - 7.5)}" y="${f(y - 7.5)}" width="15" height="15" rx="2" fill="url(#m${id})"/>`;
      out += gem(f(x), f(y), 6, "round", id, { noFire: true });
    }
    out += sparkle(60, 128, 8, 0.2) + sparkle(146, 134, 7, 1) + sparkle(100, 150, 9, 1.7);
    return out;
  }

  window.renderPiece = function (art, tone = "white", label = "") {
    const id = "a" + ++uid;
    let body = "";
    switch (art.type) {
      case "ring": body = ring(art.style, art.shape, id); break;
      case "studs": body = studs(art.shape, id); break;
      case "hoops": body = hoops(id); break;
      case "pendant": body = pendant(art.shape, id); break;
      case "tennis": body = tennis(id); break;
    }
    return `<svg class="piece" viewBox="0 0 200 200" role="img" aria-label="${String(label).replace(/[&"<]/g, "")}">${defs(id, tone)}${body}</svg>`;
  };
})();
