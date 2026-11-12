#!/usr/bin/env node
/**
 * Book cover as code (issue #12). Writes cover/out/<variant>.svg and .png.
 *
 *   node cover/render.mjs            all variants
 *   node cover/render.mjs path       one variant
 *
 * Ebook cover: 1600 x 2560 (KDP's recommended 1:1.6). Print wrap comes later
 * with the PDF (#11). Type is Ubuntu Mono, the site face, embedded so the SVG
 * renders the same everywhere. Colours: site ink, paper and the salmon accent.
 * PNGs are rendered by headless Chrome.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "out");
mkdirSync(out, { recursive: true });

const W = 1600;
const H = 2560;
const C = { ink: "#111010", paper: "#f4f1ea", salmon: "#f2b8b4", grey: "#8a8783", dim: "#3a3836" };
const BOOK = {
  title: ["Field Notes", "from a Centaur"],
  subtitle: "Learnings from one thousand days using AI",
  author: "Michell Zappa",
};
const font = readFileSync(join(here, "fonts/ubuntu-mono-400-latin.woff2")).toString("base64");

/** Deterministic random numbers, so a variant renders the same every time. */
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const text = (x, y, size, fill, s, extra = "") =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}"${extra}>${esc(s)}</text>`;

function frame(bg, body, fg = C.paper, sub = C.grey) {
  // Title block bottom left, author top left: the Stripe Press habit of small, exact type.
  const type = [
    text(140, 230, 46, sub, BOOK.author, ' letter-spacing="2"'),
    text(140, 2060, 112, fg, BOOK.title[0], ' letter-spacing="-2"'),
    text(140, 2190, 112, fg, BOOK.title[1], ' letter-spacing="-2"'),
    text(140, 2330, 44, sub, BOOK.subtitle),
  ].join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>@font-face{font-family:UM;src:url(data:font/woff2;base64,${font}) format("woff2")}text{font-family:UM,monospace}</style>
<rect width="${W}" height="${H}" fill="${bg}"/>${body}${type}</svg>\n`;
}

/** 1,000 dots: one per day, as a notebook dot grid (25 columns x 40 rows). */
function grid(x0, y0, w, h, cols = 25, rows = 40) {
  const pts = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      pts.push([x0 + (c * w) / (cols - 1), y0 + (r * h) / (rows - 1)]);
  return pts;
}

const variants = {
  /** A thousand days as a dot grid; one salmon line walks through all of them. */
  path() {
    const pts = grid(140, 380, 1320, 1440);
    const R = rng(1000);
    const cols = 25;
    // Walk row by row (boustrophedon), drifting a little more each row: steady at first, looser later.
    const walk = [];
    for (let r = 0; r < 40; r++) {
      const row = pts.slice(r * cols, r * cols + cols);
      if (r % 2) row.reverse();
      for (const [x, y] of row) {
        const d = (r / 39) ** 2 * 26;
        walk.push([x + (R() - 0.5) * d, y + (R() - 0.5) * d]);
      }
    }
    const dots = pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${C.dim}"/>`).join("");
    const line = `<polyline points="${walk.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${C.salmon}" stroke-width="3" stroke-linejoin="round"/>`;
    return frame(C.ink, dots + line);
  },

  /** Centaur: the left half of the grid stays in place (hand), the right half scatters (machine). */
  centaur() {
    const pts = grid(140, 380, 1320, 1440);
    const R = rng(7);
    const body = pts
      .map(([x, y]) => {
        const t = Math.max(0, (x - 800) / 660); // 0 left of the seam, 1 at the right edge
        const j = t ** 1.5 * 70;
        const nx = x + (R() - 0.5) * j;
        const ny = y + (R() - 0.5) * j;
        const fill = t > 0 ? C.salmon : C.paper;
        return `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${t > 0 ? 6 : 5}" fill="${fill}" opacity="${t > 0 ? 0.55 + t * 0.45 : 0.9}"/>`;
      })
      .join("");
    return frame(C.ink, body);
  },

  /** The book's own form: one exchange, my turn in salmon (a real line, from Thinking), the reply in grey. Paper ground. */
  exchange() {
    const me = `<rect x="560" y="520" width="900" height="300" rx="70" fill="${C.salmon}"/>
<rect x="1360" y="720" width="100" height="100" fill="${C.salmon}"/>
${text(630, 640, 58, C.ink, "ask me iqs if u need")}${text(630, 730, 58, C.ink, "a human perspective")}`;
    const ai = `<rect x="140" y="900" width="980" height="420" rx="70" fill="#e4e0d8"/>
<rect x="140" y="1220" width="100" height="100" fill="#e4e0d8"/>
${[0, 1, 2, 3].map((i) => `<rect x="210" y="${990 + i * 72}" width="${[820, 760, 800, 520][i]}" height="26" rx="13" fill="#c9c4bb"/>`).join("")}`;
    const gap = `<g fill="${C.grey}">${[0, 1, 2].map((i) => `<circle cx="${190 + i * 44}" cy="1420" r="12"/>`).join("")}</g>`;
    return frame(C.paper, me + ai + gap, C.ink, "#6b6762");
  },
};

const pick = process.argv[2] ? [process.argv[2]] : Object.keys(variants);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
for (const name of pick) {
  const svg = variants[name]();
  const svgPath = join(out, `${name}.svg`);
  writeFileSync(svgPath, svg);
  const html = join(out, `${name}.html`);
  writeFileSync(html, `<html><body style="margin:0">${svg}</body></html>`);
  execFileSync(chrome, ["--headless", "--disable-gpu", "--hide-scrollbars", `--window-size=${W},${H}`,
    `--screenshot=${join(out, `${name}.png`)}`, `file://${html}`], { stdio: "ignore" });
  console.log(`cover/out/${name}.png`);
}
