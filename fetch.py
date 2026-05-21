#!/usr/bin/env python3
"""
Medical Device Intelligence Tracker
Fetches news from Google News RSS, Reddit RSS, PubMed, and FDA RSS.
Generates a self-contained HTML file with all data embedded.
"""

import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import json
import ssl
import subprocess
import sys
from datetime import datetime
from pathlib import Path

try:
    import certifi
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSL_CONTEXT = ssl.create_default_context()

SCRIPT_DIR = Path(__file__).parent
OUTPUT_HTML = SCRIPT_DIR / "index.html"


def fetch_url(url, timeout=20):
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=SSL_CONTEXT) as resp:
            return resp.read()
    except Exception as e:
        print(f"  Warning: Could not fetch {url[:70]}: {e}")
        return None


def parse_rss(xml_bytes, source_name, category):
    items = []
    if not xml_bytes:
        return items
    try:
        root = ET.fromstring(xml_bytes)
        ns = {"atom": "http://www.w3.org/2005/Atom"}

        # RSS 2.0
        for item in root.findall(".//item"):
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            desc = (item.findtext("description") or "").strip()
            date = (item.findtext("pubDate") or "").strip()
            if title and link:
                items.append({"title": title, "url": link, "description": desc[:300], "date": date, "source": source_name, "category": category})

        # Atom
        if not items:
            for entry in root.findall(".//atom:entry", ns):
                title = (entry.findtext("atom:title", "", ns) or "").strip()
                link_el = entry.find("atom:link", ns)
                link = link_el.get("href", "") if link_el is not None else ""
                desc = (entry.findtext("atom:summary", "", ns) or entry.findtext("atom:content", "", ns) or "").strip()
                date = (entry.findtext("atom:updated", "", ns) or entry.findtext("atom:published", "", ns) or "").strip()
                if title and link:
                    items.append({"title": title, "url": link, "description": desc[:300], "date": date, "source": source_name, "category": category})

    except ET.ParseError as e:
        print(f"  Warning: XML parse error for {source_name}: {e}")
    return items


def fetch_google_news(query, category):
    encoded = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={encoded}&hl=en-US&gl=US&ceid=US:en"
    print(f"  Google News [{category}]...")
    return parse_rss(fetch_url(url), "Google News", category)


def fetch_reddit(subreddit, query, category):
    encoded = urllib.parse.quote(query)
    url = f"https://www.reddit.com/r/{subreddit}/search.rss?q={encoded}&sort=new&restrict_sr=1&t=month"
    print(f"  Reddit r/{subreddit} [{category}]...")
    return parse_rss(fetch_url(url), f"Reddit r/{subreddit}", category)


def fetch_pubmed(query, category):
    print(f"  PubMed [{category}]...")
    items = []
    encoded = urllib.parse.quote(query)
    search_url = (
        f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        f"?db=pubmed&term={encoded}&retmax=10&sort=date&retmode=json&datetype=pdat&reldate=365"
    )
    data = fetch_url(search_url)
    if not data:
        return items
    try:
        result = json.loads(data)
        ids = result.get("esearchresult", {}).get("idlist", [])
        if not ids:
            return items
        ids_str = ",".join(ids[:8])
        sum_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={ids_str}&retmode=json"
        sum_data = fetch_url(sum_url)
        if not sum_data:
            return items
        summaries = json.loads(sum_data).get("result", {})
        for pmid in ids:
            doc = summaries.get(pmid, {})
            if not doc or pmid == "uids":
                continue
            title = doc.get("title", "")
            date = doc.get("pubdate", "")
            journal = doc.get("source", "PubMed")
            if title:
                items.append({
                    "title": title,
                    "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                    "description": f"Journal: {journal}",
                    "date": date,
                    "source": "PubMed",
                    "category": category,
                })
    except (json.JSONDecodeError, KeyError) as e:
        print(f"  Warning: PubMed parse error: {e}")
    return items


def fetch_fda(category):
    print(f"  FDA Medical Devices RSS [{category}]...")
    url = "https://www.fda.gov/feeds/fda-medical-device-safety-alerts-and-notices.xml"
    return parse_rss(fetch_url(url), "FDA", category)


def deduplicate(items):
    seen = set()
    out = []
    for item in items:
        key = item["url"]
        if key not in seen:
            seen.add(key)
            out.append(item)
    return out


def fetch_all():
    all_items = []

    print("\n[1/3] Urology / BPH...")
    all_items += fetch_google_news(
        "urolift OR rezum OR iTind OR aquablation OR 'BPH treatment' OR 'prostate lift' site:medscape.com OR site:urologytimes.com OR site:aua.org OR site:reuters.com OR site:medicalxpress.com",
        "Urology / BPH",
    )
    all_items += fetch_reddit("Urology", "urolift OR rezum OR BPH OR aquablation", "Urology / BPH")
    all_items += fetch_reddit("ProstateCancer", "urolift OR aquablation OR rezum OR BPH", "Urology / BPH")
    all_items += fetch_pubmed(
        "UroLift[Title/Abstract] OR Rezum[Title/Abstract] OR Aquablation[Title/Abstract] OR iTind[Title/Abstract] OR Optilume[Title/Abstract]",
        "Urology / BPH",
    )

    print("\n[2/3] Radiation Spacers...")
    all_items += fetch_google_news(
        "barrigel OR spaceoar OR 'rectal spacer' OR 'prostate spacer' OR 'radiation spacer' OR 'hydrogel spacer'",
        "Radiation Spacers",
    )
    all_items += fetch_reddit("ProstateCancer", "barrigel OR spaceoar OR spacer OR radiation", "Radiation Spacers")
    all_items += fetch_reddit("RadOnc", "barrigel OR spaceoar OR spacer", "Radiation Spacers")
    all_items += fetch_pubmed(
        "Barrigel[Title/Abstract] OR SpaceOAR[Title/Abstract] OR 'rectal spacer'[Title/Abstract] OR 'hydrogel spacer'[Title/Abstract]",
        "Radiation Spacers",
    )

    print("\n[3/3] Surgical Implants / Devices...")
    all_items += fetch_google_news(
        "FDA approval 'surgical device' OR 'medical device' 'minimally invasive' 2024 OR 2025",
        "Surgical Implants",
    )
    all_items += fetch_reddit("medicine", "FDA approval surgical device implant 2024 2025", "Surgical Implants")
    all_items += fetch_reddit("Urology", "new device FDA approval", "Surgical Implants")
    all_items += fetch_fda("Surgical Implants")

    all_items = deduplicate(all_items)
    print(f"\nTotal unique items: {len(all_items)}")
    return all_items


def generate_html(items):
    updated_at = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    items_json = json.dumps(items, ensure_ascii=False)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Medical Device Intelligence Tracker</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f1117; color: #e2e8f0; min-height: 100vh; }}

  header {{ background: linear-gradient(135deg, #1a237e 0%, #0d47a1 60%, #006064 100%); padding: 44px 24px; text-align: center; }}
  header h1 {{ font-size: 2.1rem; font-weight: 700; color: #fff; letter-spacing: -0.5px; }}
  header p {{ margin-top: 10px; color: #b3e5fc; font-size: 0.95rem; }}
  .updated {{ margin-top: 14px; display: inline-block; background: rgba(255,255,255,0.12); border-radius: 20px; padding: 5px 18px; font-size: 0.8rem; color: #e0f7fa; }}

  .controls {{ max-width: 1240px; margin: 28px auto 0; padding: 0 24px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }}
  .search-box {{ flex: 1; min-width: 200px; }}
  .search-box input {{ width: 100%; padding: 11px 16px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; font-size: 0.95rem; outline: none; }}
  .search-box input:focus {{ border-color: #3b82f6; }}
  .filters {{ display: flex; flex-wrap: wrap; gap: 8px; }}
  .filter-btn {{ padding: 7px 16px; border-radius: 20px; border: 1px solid #334155; background: #1e293b; color: #94a3b8; cursor: pointer; font-size: 0.82rem; transition: all 0.15s; }}
  .filter-btn:hover {{ border-color: #3b82f6; color: #e2e8f0; }}
  .filter-btn.active {{ background: #3b82f6; border-color: #3b82f6; color: #fff; font-weight: 600; }}

  .stats {{ max-width: 1240px; margin: 20px auto 0; padding: 0 24px; }}
  .stat-row {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }}
  .stat-card {{ background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 18px; text-align: center; }}
  .stat-card .num {{ font-size: 2rem; font-weight: 700; color: #3b82f6; }}
  .stat-card .label {{ font-size: 0.73rem; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }}

  .grid {{ max-width: 1240px; margin: 24px auto 0; padding: 0 24px 60px; display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }}
  .card {{ background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s, box-shadow 0.2s; }}
  .card:hover {{ border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f620; }}
  .card-meta {{ display: flex; gap: 7px; flex-wrap: wrap; align-items: center; }}
  .badge {{ padding: 3px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }}
  .badge-urology {{ background: #1e3a5f; color: #60a5fa; }}
  .badge-radiation {{ background: #14291f; color: #4ade80; }}
  .badge-surgical {{ background: #3b1a1a; color: #f87171; }}
  .badge-source {{ background: transparent; border: 1px solid #475569; color: #94a3b8; }}
  .card-date {{ font-size: 0.72rem; color: #64748b; margin-left: auto; white-space: nowrap; }}
  .card h3 {{ font-size: 0.93rem; font-weight: 600; color: #e2e8f0; line-height: 1.45; }}
  .card h3 a {{ color: inherit; text-decoration: none; }}
  .card h3 a:hover {{ color: #60a5fa; }}
  .card p {{ font-size: 0.82rem; color: #94a3b8; line-height: 1.55; flex: 1; }}
  .read-link {{ font-size: 0.8rem; color: #3b82f6; text-decoration: none; font-weight: 500; }}
  .read-link:hover {{ text-decoration: underline; }}
  .no-results {{ grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #64748b; }}
  .no-results h3 {{ font-size: 1.1rem; margin-bottom: 8px; }}
  footer {{ text-align: center; padding: 28px; color: #475569; font-size: 0.78rem; border-top: 1px solid #1e293b; margin-top: 20px; }}
</style>
</head>
<body>

<header>
  <h1>Medical Device Intelligence</h1>
  <p>Competitive tracking &mdash; Urology / BPH &bull; Radiation Spacers &bull; Surgical Implants</p>
  <span class="updated">Last updated: {updated_at}</span>
</header>

<div class="controls">
  <div class="search-box">
    <input type="text" id="searchInput" placeholder="Search by product, keyword, source..." oninput="render()">
  </div>
  <div class="filters" id="filterRow">
    <button class="filter-btn active" onclick="setFilter('all', this)">All</button>
  </div>
</div>

<div class="stats"><div class="stat-row" id="statRow"></div></div>
<div class="grid" id="grid"></div>

<footer>
  Sources: Google News &bull; Reddit &bull; PubMed &bull; FDA &nbsp;&bull;&nbsp; Refreshes every 2 days &nbsp;&bull;&nbsp; For informational purposes only
</footer>

<script>
const DATA = {items_json};
let activeFilter = 'all';

function clean(s) {{
  return (s || '').replace(/<[^>]*>/g, '')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
}}

function fmtDate(s) {{
  if (!s) return '';
  try {{
    const d = new Date(s);
    if (isNaN(d)) return s.split(' ').slice(0,3).join(' ');
    return d.toLocaleDateString('en-US', {{month:'short', day:'numeric', year:'numeric'}});
  }} catch(e) {{ return ''; }}
}}

function catClass(cat) {{
  if (cat.includes('Urology') || cat.includes('BPH')) return 'badge-urology';
  if (cat.includes('Radiation')) return 'badge-radiation';
  return 'badge-surgical';
}}

function setFilter(val, el) {{
  activeFilter = val;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  render();
}}

function render() {{
  const term = document.getElementById('searchInput').value.toLowerCase();
  const filtered = DATA.filter(item => {{
    const matchCat = activeFilter === 'all' || item.category === activeFilter;
    const matchSearch = !term ||
      clean(item.title).toLowerCase().includes(term) ||
      (item.description || '').toLowerCase().includes(term) ||
      item.source.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term);
    return matchCat && matchSearch;
  }});

  const grid = document.getElementById('grid');
  if (!filtered.length) {{
    grid.innerHTML = '<div class="no-results"><h3>No results found</h3><p>Try a different search or filter.</p></div>';
    return;
  }}

  grid.innerHTML = filtered.map(item => {{
    const title = clean(item.title);
    const desc = clean(item.description);
    const date = fmtDate(item.date);
    const srcShort = item.source.replace('Reddit ', '');
    return `<div class="card">
      <div class="card-meta">
        <span class="badge ${{catClass(item.category)}}">${{item.category}}</span>
        <span class="badge badge-source">${{srcShort}}</span>
        ${{date ? `<span class="card-date">${{date}}</span>` : ''}}
      </div>
      <h3><a href="${{item.url}}" target="_blank" rel="noopener">${{title}}</a></h3>
      ${{desc ? `<p>${{desc}}</p>` : ''}}
      <a href="${{item.url}}" target="_blank" rel="noopener" class="read-link">Read more &rarr;</a>
    </div>`;
  }}).join('');
}}

function buildUI() {{
  const cats = [...new Set(DATA.map(i => i.category))].sort();
  const filterRow = document.getElementById('filterRow');
  cats.forEach(cat => {{
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = cat;
    btn.onclick = function() {{ setFilter(cat, this); }};
    filterRow.appendChild(btn);
  }});

  const counts = {{}};
  DATA.forEach(i => counts[i.category] = (counts[i.category] || 0) + 1);
  const statRow = document.getElementById('statRow');
  statRow.innerHTML =
    `<div class="stat-card"><div class="num">${{DATA.length}}</div><div class="label">Total items</div></div>` +
    Object.entries(counts).map(([cat, n]) =>
      `<div class="stat-card"><div class="num">${{n}}</div><div class="label">${{cat}}</div></div>`
    ).join('');

  render();
}}

buildUI();
</script>
</body>
</html>"""


def main():
    print("=== Medical Device Intelligence Tracker ===")
    items = fetch_all()
    print("\nGenerating HTML...")
    html = generate_html(items)
    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Saved: {OUTPUT_HTML}")
    if sys.platform == "darwin":
        subprocess.run(["open", str(OUTPUT_HTML)], check=False)


if __name__ == "__main__":
    main()
