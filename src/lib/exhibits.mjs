// Markdown → exhibits.
// A fenced ```chart or ```table block becomes a numbered exhibit rendered at build time.
// An image with a title ("caption") becomes a numbered figure. Plain GFM tables get
// numeric-column alignment and a scroll wrapper.
import { visit } from 'unist-util-visit';

/* ---------- parsing ---------- */

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function parseBlock(src) {
  const lines = src.replace(/\r/g, '').split('\n');
  const sep = lines.findIndex((l) => /^\s*-{3,}\s*$/.test(l));
  const head = sep === -1 ? [] : lines.slice(0, sep);
  const body = sep === -1 ? lines : lines.slice(sep + 1);
  const opts = {};
  for (const l of head) {
    const m = l.match(/^\s*([a-zA-Z_]+)\s*:\s*(.*)$/);
    if (m) opts[m[1].toLowerCase()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  const rows = parseDelimited(body.filter((l) => l.trim() !== '').join('\n'));
  return { opts, rows };
}

// Tab-separated when pasted from Excel, comma-separated otherwise (quotes supported).
function parseDelimited(text) {
  if (!text) return [];
  const delim = text.split('\n')[0].includes('\t') ? '\t' : text.split('\n')[0].includes('|') ? '|' : ',';
  const out = [];
  for (const line of text.split('\n')) {
    if (delim === '|' && /^\s*\|?\s*:?-{2,}/.test(line)) continue;
    const cells = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q;
      } else if (c === delim && !q) { cells.push(cur.trim()); cur = ''; } else cur += c;
    }
    cells.push(cur.trim());
    if (delim === '|') {
      if (cells[0] === '') cells.shift();
      if (cells[cells.length - 1] === '') cells.pop();
    }
    out.push(cells);
  }
  return out;
}

export function toNumber(raw) {
  if (raw == null) return NaN;
  let s = String(raw).trim();
  if (!s || s === '-' || s === '–' || /^n\.?a\.?$/i.test(s)) return NaN;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  s = s.replace(/^[~≈]\s*/, ''); // approximate values: ~31.2
  s = s.replace(/^[A-Z]{2,3}\s*(?=[$€£¥\d])/, ''); // currency codes: US$, CHF, HK$
  s = s.replace(/[$€£¥,%x×\s]/gi, '').replace(/[a-z]+$/i, '').replace(/^[−–]/, '-');
  const n = Number(s);
  return Number.isFinite(n) ? (neg ? -n : n) : NaN;
}

const isNumeric = (raw) => Number.isFinite(toNumber(raw));

/* ---------- number formatting ---------- */

function makeFormat(opts) {
  const prefix = opts.prefix ?? '';
  const suffix = opts.suffix ?? '';
  const fixed = opts.decimals !== undefined && opts.decimals !== '' ? Number(opts.decimals) : null;
  return (v, d = fixed) => {
    const digits = d ?? (Math.abs(v) < 10 && !Number.isInteger(v) ? 1 : 0);
    const body = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    return `${v < 0 ? '−' : ''}${prefix}${body}${suffix}`;
  };
}

function niceTicks(min, max, count = 5) {
  if (min === max) { max = min + 1; }
  const span = max - min;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) ?? 10 * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  const dec = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  return { ticks, lo, hi, dec: step % 1 === 0 ? 0 : Math.min(dec + (step / mag === 2.5 ? 1 : 0), 4) };
}

/* ---------- chart geometry ---------- */

const FONT_W = 6.6; // approx px per character at 12px Inter, used for gutter sizing

// Column/bar path with a 4px rounded data end and a square baseline end.
function barPath(x, y, w, h, dir) {
  const r = Math.min(4, w / 2, Math.abs(h));
  if (Math.abs(h) < 0.5) return '';
  if (dir === 'up') {
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  if (dir === 'down') {
    return `M${x},${y}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w - r}Q${x + w},${y + h} ${x + w},${y + h - r}V${y}Z`;
  }
  if (dir === 'right') {
    return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
  }
  return `M${x + w},${y}H${x + r}Q${x},${y} ${x},${y + r}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w}Z`;
}

const f1 = (n) => Math.round(n * 10) / 10;

function wrapLabel(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + ' ' + w).length <= maxChars) lines[lines.length - 1] = last + ' ' + w;
    else lines.push(w);
  }
  if (lines.length > 3) return [...lines.slice(0, 2), lines.slice(2).join(' ').slice(0, Math.max(3, maxChars - 1)) + '…'];
  return lines.length ? lines : [''];
}

function renderSvg(spec, W, compact) {
  const { type, cats, series, fmt, opts } = spec;
  const H = compact ? 260 : 340;
  const fs = compact ? 11 : 12;
  const parts = [];
  const tip = (s) => ` data-tip="${esc(s)}"`;

  if (type === 'barh') {
    const labelW = Math.min(compact ? 120 : 200, Math.max(...cats.map((c) => c.length)) * FONT_W + 10);
    const all = series.flatMap((s) => s.values).filter(Number.isFinite);
    const { ticks, lo, hi, dec } = niceTicks(Math.min(0, ...all), Math.max(0, ...all), compact ? 3 : 5);
    const valW = Math.max(...all.map((v) => fmt(v).length)) * FONT_W + 8;
    const x0 = labelW, x1 = W - valW;
    const band = series.length * 18 + 14;
    const h = cats.length * band + 26;
    const sx = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
    for (const t of ticks) {
      parts.push(`<line class="grid" x1="${f1(sx(t))}" x2="${f1(sx(t))}" y1="0" y2="${h - 22}"/>`);
      parts.push(`<text class="tick" x="${f1(sx(t))}" y="${h - 6}" text-anchor="middle">${esc(fmt(t, dec))}</text>`);
    }
    cats.forEach((c, i) => {
      const yb = i * band + 7;
      parts.push(`<text class="cat" x="${x0 - 10}" y="${f1(yb + (series.length * 18) / 2 + 4)}" text-anchor="end">${esc(c)}</text>`);
      series.forEach((s, j) => {
        const v = s.values[i];
        if (!Number.isFinite(v)) return;
        const y = yb + j * 18;
        const a = sx(0), b = sx(v);
        const d = barPath(Math.min(a, b), y, Math.abs(b - a), 16, v >= 0 ? 'right' : 'left');
        parts.push(`<path class="mk s${s.slot}" d="${d}"${tip(`${s.name} · ${c}: ${fmt(v)}`)}/>`);
        parts.push(`<text class="val" x="${f1(v >= 0 ? b + 6 : b - 6)}" y="${y + 12}" text-anchor="${v >= 0 ? 'start' : 'end'}">${esc(fmt(v))}</text>`);
      });
    });
    parts.push(`<line class="axis" x1="${f1(sx(0))}" x2="${f1(sx(0))}" y1="0" y2="${h - 22}"/>`);
    return svgWrap(W, h, fs, parts);
  }

  // Vertical forms: line, bar, stacked, waterfall
  let lo, hi, ticks, dec;
  let wf = null;
  if (type === 'waterfall') {
    wf = [];
    let run = 0;
    cats.forEach((c, i) => {
      const raw = spec.rawCats[i];
      const v = series[0].values[i];
      if (i === 0 && Number.isFinite(v)) {
        // The first row is the starting point of the bridge.
        wf.push({ c, a: 0, b: v, kind: 'total', v });
        run = v;
      } else if (raw.startsWith('=') || !Number.isFinite(v)) {
        const total = Number.isFinite(v) && raw.startsWith('=') && spec.explicitTotals ? v : run;
        wf.push({ c, a: 0, b: total, kind: 'total', v: total });
        run = total;
      } else {
        wf.push({ c, a: run, b: run + v, kind: v >= 0 ? 'up' : 'down', v });
        run += v;
      }
    });
    const vals = wf.flatMap((d) => [d.a, d.b]);
    ({ ticks, lo, hi, dec } = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), compact ? 4 : 5));
  } else if (type === 'stacked') {
    const pos = cats.map((_, i) => series.reduce((t, s) => t + Math.max(0, s.values[i] || 0), 0));
    const neg = cats.map((_, i) => series.reduce((t, s) => t + Math.min(0, s.values[i] || 0), 0));
    ({ ticks, lo, hi, dec } = niceTicks(Math.min(0, ...neg), Math.max(0, ...pos), compact ? 4 : 5));
  } else {
    const all = series.flatMap((s) => s.values).filter(Number.isFinite);
    let mn = Math.min(...all), mx = Math.max(...all);
    if (type === 'bar' || opts.zero === 'true') { mn = Math.min(0, mn); mx = Math.max(0, mx); }
    else { const pad = (mx - mn) * 0.08 || Math.abs(mx) * 0.1 || 1; mn -= pad; mx += pad; }
    ({ ticks, lo, hi, dec } = niceTicks(mn, mx, compact ? 4 : 5));
  }

  const tickW = Math.max(...ticks.map((t) => fmt(t, dec).length)) * FONT_W + 10;
  const n = cats.length;
  const lineH = fs + 2;

  // Line charts with 2–4 series carry direct labels at each line's end when they don't collide.
  let endLabels = null;
  if (type === 'line' && !compact && series.length >= 2 && series.length <= 4) {
    const plotH = H - 16 - lineH - 10;
    const ends = series
      .map((s) => {
        const last = s.values.map((v, i) => [v, i]).filter(([v]) => Number.isFinite(v)).pop();
        return last ? { s, v: last[0], y: plotH * (1 - (last[0] - lo) / (hi - lo)) } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.y - b.y);
    const clear = ends.every((e, k) => k === 0 || e.y - ends[k - 1].y >= lineH + 2);
    if (clear) endLabels = ends;
  }
  const labelW = endLabels ? Math.max(...series.map((s) => s.name.length)) * FONT_W + 14 : 0;
  const x0 = tickW, x1 = W - (compact ? 8 : 12) - labelW;

  // Category labels: line charts thin them out; column charts wrap them onto up to three lines.
  let every = 1;
  let catLines = cats.map((c) => [c]);
  if (type === 'line') {
    every = Math.max(1, Math.ceil((n * (Math.max(...cats.map((c) => c.length)) * FONT_W + 12)) / (x1 - x0)));
  } else {
    const bandW = (x1 - x0) / n;
    const maxChars = Math.max(3, Math.floor((bandW - 6) / FONT_W));
    catLines = cats.map((c) => wrapLabel(c, maxChars));
    const longestWord = Math.max(...cats.flatMap((c) => c.split(/\s+/)).map((w) => w.length));
    if (longestWord * FONT_W > bandW + 8) every = Math.ceil((longestWord * FONT_W) / bandW);
  }
  const nLines = Math.max(...catLines.map((l) => l.length));
  const y0 = 10, y1 = H - 16 - nLines * lineH;
  const sy = (v) => y1 - ((v - lo) / (hi - lo)) * (y1 - y0);
  const catLabel = (i, x) => {
    const [first, ...more] = catLines[i];
    return `<text class="tick" x="${f1(x)}" y="${f1(y1 + 6 + lineH)}" text-anchor="middle">${esc(first)}${more.map((l) => `<tspan x="${f1(x)}" dy="${lineH}">${esc(l)}</tspan>`).join('')}</text>`;
  };

  for (const t of ticks) {
    parts.push(`<line class="${t === 0 ? 'axis' : 'grid'}" x1="${x0}" x2="${x1}" y1="${f1(sy(t))}" y2="${f1(sy(t))}"/>`);
    parts.push(`<text class="tick" x="${x0 - 8}" y="${f1(sy(t) + 4)}" text-anchor="end">${esc(fmt(t, dec))}</text>`);
  }

  if (type === 'line') {
    const step = n > 1 ? (x1 - x0 - 16) / (n - 1) : 0;
    const sx = (i) => (n > 1 ? x0 + 8 + i * step : (x0 + x1) / 2);
    cats.forEach((c, i) => {
      if (i % every === 0 || i === n - 1) parts.push(catLabel(i, sx(i)));
    });
    series.forEach((s) => {
      let d = '';
      let pen = false;
      s.values.forEach((v, i) => {
        if (!Number.isFinite(v)) { pen = false; return; }
        d += `${pen ? 'L' : 'M'}${f1(sx(i))},${f1(sy(v))}`;
        pen = true;
      });
      parts.push(`<path class="ln s${s.slot}" d="${d}"/>`);
      const last = s.values.map((v, i) => [v, i]).filter(([v]) => Number.isFinite(v)).pop();
      if (last) parts.push(`<circle class="dot s${s.slot}" cx="${f1(sx(last[1]))}" cy="${f1(sy(last[0]))}" r="4"/>`);
    });
    if (endLabels) {
      for (const e of endLabels) {
        const lx = sx(n - 1) + 10;
        parts.push(`<text class="end" x="${f1(lx)}" y="${f1(sy(e.v) + 4)}">${esc(e.s.name)}</text>`);
      }
    }
    // Hit targets: one column per category carrying every series' value.
    cats.forEach((c, i) => {
      const lines = series.map((s) => `${s.name}: ${Number.isFinite(s.values[i]) ? fmt(s.values[i]) : '–'}`).join('\n');
      const w = n > 1 ? step : x1 - x0;
      parts.push(`<rect class="hit" x="${f1(sx(i) - w / 2)}" y="${y0}" width="${f1(w)}" height="${y1 - y0}" data-x="${f1(sx(i))}"${tip(`${c}\n${lines}`)}/>`);
    });
    return svgWrap(W, H, fs, parts);
  }

  const bandW = (x1 - x0) / n;
  const groups = type === 'bar' ? series.length : 1;
  const barW = Math.min(compact ? 18 : 24, (bandW * 0.7 - (groups - 1) * 2) / groups);
  cats.forEach((c, i) => {
    const cx = x0 + bandW * (i + 0.5);
    if (i % every === 0 || i === n - 1) parts.push(catLabel(i, cx));
    if (type === 'bar') {
      const gw = groups * barW + (groups - 1) * 2;
      series.forEach((s, j) => {
        const v = s.values[i];
        if (!Number.isFinite(v)) return;
        const x = cx - gw / 2 + j * (barW + 2);
        const top = sy(Math.max(0, v)), bot = sy(Math.min(0, v));
        parts.push(`<path class="mk s${s.slot}" d="${barPath(f1(x), f1(top), f1(barW), f1(bot - top), v >= 0 ? 'up' : 'down')}"${tip(`${s.name} · ${c}: ${fmt(v)}`)}/>`);
        // Value on the cap when the chart is simple enough to label every bar.
        if (series.length === 1 && n <= (compact ? 6 : 10)) {
          const ly = v >= 0 ? top - 6 : bot + 14;
          parts.push(`<text class="val" x="${f1(x + barW / 2)}" y="${f1(ly)}" text-anchor="middle">${esc(fmt(v))}</text>`);
        }
      });
    } else if (type === 'stacked') {
      let up = 0, dn = 0;
      const segs = series.map((s) => ({ s, v: s.values[i] })).filter((d) => Number.isFinite(d.v) && d.v !== 0);
      const lastUp = segs.filter((d) => d.v > 0).pop();
      segs.forEach(({ s, v }) => {
        const a = v > 0 ? up : dn;
        const b = a + v;
        if (v > 0) up = b; else dn = b;
        let top = sy(Math.max(a, b)), bot = sy(Math.min(a, b));
        // 2px surface gap between stacked segments
        if (v > 0 && a !== 0) bot -= 2;
        if (v < 0 && a !== 0) top += 2;
        const rounded = v > 0 ? lastUp && s === lastUp.s : false;
        const d = rounded
          ? barPath(f1(cx - barW / 2), f1(top), f1(barW), f1(bot - top), 'up')
          : `M${f1(cx - barW / 2)},${f1(top)}h${f1(barW)}v${f1(bot - top)}h${f1(-barW)}Z`;
        parts.push(`<path class="mk s${s.slot}" d="${d}"${tip(`${s.name} · ${c}: ${fmt(v)}`)}/>`);
      });
      if (!compact || n <= 6) {
        const tot = series.reduce((t, s) => t + (s.values[i] || 0), 0);
        parts.push(`<text class="val" x="${f1(cx)}" y="${f1(sy(up) - 6)}" text-anchor="middle">${esc(fmt(tot))}</text>`);
      }
    } else if (type === 'waterfall') {
      const d = wf[i];
      const top = sy(Math.max(d.a, d.b)), bot = sy(Math.min(d.a, d.b));
      const w = Math.min(compact ? 22 : 36, bandW * 0.62);
      const cls = d.kind === 'total' ? 'wf-total' : d.kind === 'up' ? 'wf-up' : 'wf-down';
      parts.push(`<path class="mk ${cls}" d="${barPath(f1(cx - w / 2), f1(top), f1(w), f1(Math.max(1, bot - top)), d.kind === 'down' ? 'down' : 'up')}"${tip(`${c}: ${d.kind === 'total' ? fmt(d.v) : (d.v >= 0 ? '+' : '') + fmt(d.v)}`)}/>`);
      if (i < wf.length - 1) {
        const ny = sy(d.b);
        parts.push(`<line class="conn" x1="${f1(cx + w / 2)}" x2="${f1(cx + bandW - w / 2)}" y1="${f1(ny)}" y2="${f1(ny)}"/>`);
      }
      const label = d.kind === 'total' ? fmt(d.v) : `${d.v >= 0 ? '+' : ''}${fmt(d.v)}`;
      const ly = d.kind === 'down' ? bot + 14 : top - 6;
      if (!compact || n <= 7) parts.push(`<text class="val" x="${f1(cx)}" y="${f1(ly)}" text-anchor="middle">${esc(label)}</text>`);
    }
  });
  return svgWrap(W, H, fs, parts);
}

function svgWrap(W, H, fs, parts) {
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="font-size:${fs}px" role="img" aria-hidden="true">${parts.join('')}</svg>`;
}

/* ---------- exhibit HTML ---------- */

// "Table 2: Title" / "Figure 1. Title" keeps the author's own label instead of auto-numbering.
const LABEL_RE = /^\s*((?:Table|Figure|Exhibit|Chart)\s+[A-Za-z0-9.]+)\s*[:.\u2013-]\s*(.*)$/i;
export function splitLabel(text) {
  const m = String(text ?? '').match(LABEL_RE);
  return m ? { label: m[1], title: m[2].trim() } : null;
}

function caption(n, opts, kind) {
  let { title: t, label } = opts;
  const own = !label && splitLabel(t);
  if (own) ({ label, title: t } = own);
  const title = t ? `<span class="exhibit-title">${esc(t)}</span>` : '';
  const sub = opts.subtitle ? `<span class="exhibit-sub">${esc(opts.subtitle)}</span>` : '';
  return `<figcaption class="exhibit-head"><span class="exhibit-label">${esc(label || `${kind} ${n}`)}</span>${title}${sub}</figcaption>`;
}

function footer(opts) {
  const note = opts.note ? `<p class="exhibit-note">${esc(opts.note)}</p>` : '';
  const src = opts.source ? `<p class="exhibit-source">Source: ${esc(opts.source)}</p>` : '';
  return note + src;
}

function htmlTable(rows, opts, cls = '') {
  if (!rows.length) return '';
  const [head, ...body] = rows;
  const numCol = head.map((_, j) => {
    if (j === 0) return false;
    const filled = body.map((r) => String(r[j] ?? '').trim()).filter(Boolean);
    return filled.length > 0 && filled.filter(isNumeric).length / filled.length >= 0.6;
  });
  // Text-heavy tables (notes, checklists) get wider columns and scroll instead of squeezing.
  const cellsAll = body.flatMap((r) => r.slice(1)).map((c) => String(c ?? '').trim()).filter(Boolean);
  const avgLen = cellsAll.reduce((t, c) => t + c.length, 0) / Math.max(1, cellsAll.length);
  if (head.length >= 4 && avgLen > 16) cls = `${cls} text-table`.trim();
  const th = head.map((h, j) => `<th scope="col"${numCol[j] ? ' class="num"' : ''}>${esc(h)}</th>`).join('');
  // base: "8.0x | 11.1%" marks the base-case cell (row label | column header).
  const [baseRow, baseCol] = String(opts.base ?? '').split('|').map((x) => x.trim());
  const tr = body
    .map((r) => {
      const raw = String(r[0] ?? '').trim();
      // A row with only a label is a group heading ("Income statement", "# Precedents").
      if (r.slice(1).every((c) => !String(c ?? '').trim()))
        return `<tr class="group"><th scope="rowgroup" colspan="${head.length}">${esc(raw.replace(/^[#=]\s*/, ''))}</th></tr>`;
      const total = /^=/.test(raw);
      const sub = /^[a-z]/.test(raw);
      const label = raw.replace(/^=\s*/, '');
      const cells = head
        .map((h, j) => {
          const v = j === 0 ? label : r[j] ?? '';
          if (j === 0) return `<th scope="row">${esc(v)}</th>`;
          const isBase = baseRow && label === baseRow && String(h).trim() === baseCol;
          const cls = [numCol[j] && 'num', toNumber(v) < 0 && 'neg', isBase && 'base'].filter(Boolean).join(' ');
          return `<td${cls ? ` class="${cls}"` : ''}>${esc(v)}</td>`;
        })
        .join('');
      const rc = [total && 'total', sub && 'sub'].filter(Boolean).join(' ');
      return `<tr${rc ? ` class="${rc}"` : ''}>${cells}</tr>`;
    })
    .join('');
  return `<div class="table-wrap"><table class="${cls}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

/* ---------- range (football field) ---------- */
// Rows: label, low, mid, high. A row with only a label (or starting with #) is a group heading.
// Options: marker (value of a vertical reference line) and marker_label.

function rangeSvg(items, fmt, opts, W, compact) {
  const fs = compact ? 11 : 12;
  const lineH = fs + 3;
  const data = items.filter((d) => !d.group);
  const marker = toNumber(opts.marker);
  const hasMarker = Number.isFinite(marker);
  const all = data.flatMap((d) => [d.lo, d.hi]).concat(hasMarker ? [marker] : []);
  const { ticks, lo, hi, dec } = niceTicks(Math.min(...all), Math.max(...all), compact ? 4 : 6);
  const valW = Math.max(...data.flatMap((d) => [fmt(d.lo).length, fmt(d.hi).length])) * FONT_W + 8;
  const labelW = compact ? 0 : Math.min(250, Math.max(...items.map((d) => d.label.length)) * FONT_W + 16);
  const x0 = labelW + valW, x1 = W - valW;
  const sx = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
  const marks = [];
  const grid = [];
  let y = hasMarker ? 24 : 6;
  for (const d of items) {
    if (d.group) {
      y += 8;
      marks.push(`<text class="grp" x="0" y="${f1(y + fs)}">${esc(d.label)}</text>`);
      y += lineH + 6;
      continue;
    }
    const bh = 14;
    if (compact) {
      const ll = wrapLabel(d.label, Math.floor(W / FONT_W));
      ll.forEach((l, k) => marks.push(`<text class="cat" x="0" y="${f1(y + fs + k * lineH)}">${esc(l)}</text>`));
      y += ll.length * lineH + 3;
    } else {
      const ll = wrapLabel(d.label, Math.floor((labelW - 12) / FONT_W)).slice(0, 2);
      const rowH = Math.max(bh, ll.length * lineH);
      const labelTop = y + (rowH - ll.length * lineH) / 2;
      ll.forEach((l, k) => marks.push(`<text class="cat" x="0" y="${f1(labelTop + fs - 1 + k * lineH)}">${esc(l)}</text>`));
      y += (rowH - bh) / 2;
      d._after = (rowH - bh) / 2;
    }
    const a = sx(d.lo), b = sx(d.hi), m = sx(d.mid);
    const tip = ` data-tip="${esc(`${d.label}\n25th: ${fmt(d.lo)} · median: ${fmt(d.mid)} · 75th: ${fmt(d.hi)}`)}"`;
    marks.push(`<rect class="mk s1" x="${f1(a)}" y="${y}" width="${f1(Math.max(1, m - a - 1))}" height="${bh}" rx="3"${tip}/>`);
    marks.push(`<rect class="mk s1 upper" x="${f1(m + 1)}" y="${y}" width="${f1(Math.max(1, b - m - 1))}" height="${bh}" rx="3"${tip}/>`);
    marks.push(`<text class="val" x="${f1(a - 6)}" y="${y + 11}" text-anchor="end">${esc(fmt(d.lo))}</text>`);
    marks.push(`<text class="val" x="${f1(b + 6)}" y="${y + 11}">${esc(fmt(d.hi))}</text>`);
    y += bh + (d._after ?? 0) + (compact ? 12 : 14);
  }
  const bottom = y;
  for (const t of ticks) {
    grid.push(`<line class="grid" x1="${f1(sx(t))}" x2="${f1(sx(t))}" y1="${hasMarker ? 18 : 0}" y2="${f1(bottom)}"/>`);
    marks.push(`<text class="tick" x="${f1(sx(t))}" y="${f1(bottom + 16)}" text-anchor="middle">${esc(fmt(t, dec))}</text>`);
  }
  if (hasMarker) {
    const mx = sx(marker);
    grid.push(`<line class="ref" x1="${f1(mx)}" x2="${f1(mx)}" y1="16" y2="${f1(bottom)}"/>`);
    const anchor = mx > W * 0.7 ? 'end' : mx < W * 0.3 ? 'start' : 'middle';
    marks.push(`<text class="ref-label" x="${f1(mx)}" y="11" text-anchor="${anchor}">${esc(`${opts.marker_label || 'Reference'} ${fmt(marker)}`)}</text>`);
  }
  return svgWrap(W, Math.ceil(bottom + 24), fs, [...grid, ...marks]);
}

function renderRange(opts, rows, n, err) {
  const [head, ...body] = rows;
  if (head.length < 4) return err('a range chart needs four columns: label, low, mid, high.');
  const items = body.map((r) => {
    const label = String(r[0] ?? '').replace(/^#\s*/, '');
    const nums = r.slice(1, 4).map(toNumber);
    if (String(r[0] ?? '').startsWith('#') || nums.every((v) => !Number.isFinite(v))) return { group: true, label };
    return { label, lo: nums[0], mid: nums[1], hi: nums[2] };
  });
  if (!items.some((d) => !d.group && [d.lo, d.mid, d.hi].every(Number.isFinite)))
    return err('no complete low / mid / high rows found.');
  const fmt = makeFormat(opts);
  const legend = `<ul class="legend"><li><i class="sw s1"></i>${esc(`${head[1]} to ${head[3]}, split at the ${head[2].toLowerCase()}`)}</li>${opts.marker ? `<li><i class="sw sw-ref"></i>${esc(opts.marker_label || 'Reference')}</li>` : ''}</ul>`;
  return `<figure class="exhibit exhibit-chart" data-type="range">${caption(n, opts, 'Exhibit')}${legend}<div class="chart" role="img" aria-label="${esc(opts.title || 'Range chart')}. Data table follows."><div class="chart-wide">${rangeSvg(items, fmt, opts, 680, false)}</div><div class="chart-narrow">${rangeSvg(items, fmt, opts, 360, true)}</div></div>${footer(opts)}<details class="exhibit-data"><summary>View data</summary>${htmlTable(rows, opts)}</details></figure>`;
}

export function renderChart(src, n) {
  const { opts, rows } = parseBlock(src);
  const type = (opts.type || 'bar').toLowerCase();
  const err = (msg) => `<div class="exhibit-error"><strong>Chart could not be drawn:</strong> ${esc(msg)}</div>`;
  if (!['line', 'bar', 'barh', 'stacked', 'waterfall', 'range'].includes(type))
    return err(`unknown type "${type}". Use line, bar, barh, stacked, waterfall or range.`);
  if (type === 'range') return renderRange(opts, rows, n, err);
  if (rows.length < 2 || rows[0].length < 2)
    return err('add a header row and at least one data row below the --- line.');
  const [head, ...body] = rows;
  const rawCats = body.map((r) => r[0] ?? '');
  const cats = rawCats.map((c) => c.replace(/^=\s*/, ''));
  const series = head.slice(1, type === 'waterfall' ? 2 : 9).map((name, j) => ({
    name,
    slot: j + 1,
    values: body.map((r) => toNumber(r[j + 1])),
  }));
  if (!series.some((s) => s.values.some(Number.isFinite))) return err('no numeric values found.');
  const fmt = makeFormat(opts);
  const spec = { type, cats, rawCats, series, fmt, opts, explicitTotals: opts.totals === 'given' };
  const vals = series[0].values;
  const wfKinds = [
    ['wf-up', 'Increase', vals.some((v, i) => i > 0 && v > 0 && !rawCats[i].startsWith('='))],
    ['wf-down', 'Decrease', vals.some((v, i) => i > 0 && v < 0 && !rawCats[i].startsWith('='))],
    ['wf-total', 'Total', true],
  ];
  const legend =
    type === 'waterfall'
      ? `<ul class="legend">${wfKinds.filter(([, , on]) => on).map(([cls, name]) => `<li><i class="sw ${cls}"></i>${name}</li>`).join('')}</ul>`
      : series.length > 1
        ? `<ul class="legend">${series.map((s) => `<li><i class="sw s${s.slot}${type === 'line' ? ' sw-line' : ''}"></i>${esc(s.name)}</li>`).join('')}</ul>`
        : '';
  const label = opts.title || `${type} chart`;
  return `<figure class="exhibit exhibit-chart" data-type="${type}">${caption(n, opts, 'Exhibit')}${legend}<div class="chart" role="img" aria-label="${esc(label)}. Data table follows."><div class="chart-wide">${renderSvg(spec, 680, false)}</div><div class="chart-narrow">${renderSvg(spec, 360, true)}</div></div>${footer(opts)}<details class="exhibit-data"><summary>View data</summary>${htmlTable(rows, opts)}</details></figure>`;
}

export function renderTable(src, n) {
  const { opts, rows } = parseBlock(src);
  if (!rows.length) return `<div class="exhibit-error"><strong>Table is empty.</strong> Paste rows below the --- line.</div>`;
  const hasHead = !!opts.title;
  return `<figure class="exhibit exhibit-table">${hasHead ? caption(n, opts, 'Exhibit') : ''}${htmlTable(rows, opts)}${footer(opts)}</figure>`;
}

// Pasted cells (tab, comma or pipe separated) → table HTML, for the key data panel.
export function tableFromText(text) {
  return htmlTable(parseBlock(text ?? '').rows, {});
}

/* ---------- unified plugins ---------- */

export function remarkExhibits() {
  return (tree) => {
    let n = 0;
    visit(tree, (node, index, parent) => {
      if (node.type === 'code' && (node.lang === 'chart' || node.lang === 'table') && parent) {
        n += 1;
        const html = node.lang === 'chart' ? renderChart(node.value, n) : renderTable(node.value, n);
        parent.children[index] = { type: 'html', value: html };
        return;
      }
      // "Table: Caption" on the line before a Markdown table → numbered caption
      if (node.type === 'paragraph' && parent && parent.children[index + 1]?.type === 'table') {
        const text = node.children.map((c) => c.value ?? (c.children || []).map((d) => d.value ?? '').join('')).join('');
        const own = splitLabel(text);
        const m = own ? null : text.match(/^\s*(?:Table|Exhibit)\s*:\s*(.+)$/i);
        if (own || m) {
          n += 1;
          const label = own ? own.label : `Exhibit ${n}`;
          const title = own ? own.title : m[1].trim();
          parent.children[index] = {
            type: 'html',
            value: `<p class="exhibit-head table-caption"><span class="exhibit-label">${esc(label)}</span><span class="exhibit-title">${esc(title)}</span></p>`,
          };
          return;
        }
      }
      // ![alt](src "Caption") alone in a paragraph → numbered figure
      if (node.type === 'paragraph' && node.children.length === 1 && node.children[0].type === 'image') {
        const img = node.children[0];
        node.data = { hName: 'figure', hProperties: { className: ['exhibit', 'exhibit-image'] } };
        if (img.title) {
          n += 1;
          const own = splitLabel(img.title);
          const cap = own ? own.title : img.title;
          const capLabel = own ? own.label : `Exhibit ${n}`;
          img.title = null;
          node.children.push({
            type: 'exhibitCaption',
            data: {
              hName: 'figcaption',
              hProperties: { className: ['exhibit-head', 'exhibit-head-below'] },
              hChildren: [
                { type: 'element', tagName: 'span', properties: { className: ['exhibit-label'] }, children: [{ type: 'text', value: capLabel }] },
                { type: 'element', tagName: 'span', properties: { className: ['exhibit-title'] }, children: [{ type: 'text', value: cap }] },
              ],
            },
          });
        }
      }
    });
  };
}

const textOf = (node) =>
  node.type === 'text' ? node.value : (node.children || []).map(textOf).join('');

// Plain Markdown tables: right-align numeric columns, wrap for horizontal scroll.
export function rehypeTables() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || node.properties?.dataWrapped) return;
      if (String(parent.properties?.className ?? '').includes('table-wrap')) return;
      node.properties = { ...node.properties, dataWrapped: true };
      const rows = [];
      visit(node, 'element', (r) => { if (r.tagName === 'tr') rows.push(r); });
      const cellsOf = (r) => r.children.filter((c) => c.type === 'element' && (c.tagName === 'td' || c.tagName === 'th'));
      const width = Math.max(0, ...rows.map((r) => cellsOf(r).length));
      // A body row whose label starts with "Total" gets the total-row rule.
      rows.slice(1).forEach((r) => {
        const first = cellsOf(r)[0];
        if (first && /^\s*total\b/i.test(textOf(first)))
          r.properties = { ...r.properties, className: [...(r.properties?.className || []), 'total'] };
      });
      for (let j = 1; j < width; j++) {
        const bodyCells = rows.slice(1).map((r) => cellsOf(r)[j]).filter(Boolean);
        if (!bodyCells.some((c) => isNumeric(textOf(c)))) continue;
        rows.forEach((r) => {
          const c = cellsOf(r)[j];
          if (!c) return;
          const cls = ['num'];
          if (toNumber(textOf(c)) < 0) cls.push('neg');
          c.properties = { ...c.properties, className: [...(c.properties?.className || []), ...cls] };
          delete c.properties.align;
          if (c.properties.style) delete c.properties.style;
        });
      }
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrap'] },
        children: [node],
      };
    });
  };
}
