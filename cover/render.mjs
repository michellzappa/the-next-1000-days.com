#!/usr/bin/env node
/**
 * Book cover as code (issue #12). Writes cover/out/<variant>.svg and .png.
 *
 *   node cover/render.mjs              all variants
 *   node cover/render.mjs centaur      one variant
 *
 * Ebook cover: 1600 x 2560 (KDP's recommended 1:1.6). Print wrap comes later
 * with the PDF (#11). Layout follows business-book covers: a big bold title
 * that reads at thumbnail size, a large author name, one image between them.
 * Type is Ubuntu Mono 400/700, the site face, embedded so the SVG renders the
 * same everywhere. Colours: site ink, paper and the salmon accent.
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
const M = 120; // side margin
const C = { ink: "#111010", paper: "#f4f1ea", salmon: "#f2b8b4", grey: "#8a8783", dim: "#3a3836" };
const BOOK = {
  title: ["FIELD NOTES", "FROM A", "CENTAUR"],
  subtitle: "Learnings from one thousand days using AI",
  author: "MICHELL ZAPPA",
};
const woff = (w) => readFileSync(join(here, `fonts/ubuntu-mono-${w}-latin.woff2`)).toString("base64");

/** Deterministic random numbers, so a variant renders the same every time. */
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const text = (x, y, size, fill, s, extra = "") =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}"${extra}>${esc(s)}</text>`;

/**
 * Business-book frame: subtitle as a kicker on top, the title huge and bold,
 * the image in the middle band, a salmon rule, and the author big at the foot.
 * `art(x, y, w, h)` draws the image into the band.
 */
function frame({ bg, fg, sub, rule }, art) {
  const size = 236; // "FIELD NOTES" (11 chars at 0.5em) fills the measure
  const type = [
    text(M, 210, 50, sub, BOOK.subtitle),
    ...BOOK.title.map((line, i) => text(M - 8, 470 + i * 215, size, fg, line, ' font-weight="700" letter-spacing="-4"')),
    `<rect x="${M}" y="2200" width="220" height="14" fill="${rule}"/>`,
    text(M, 2390, 120, fg, BOOK.author, ' font-weight="700" letter-spacing="-1"'),
  ].join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>@font-face{font-family:UM;font-weight:400;src:url(data:font/woff2;base64,${woff(400)}) format("woff2")}@font-face{font-family:UM;font-weight:700;src:url(data:font/woff2;base64,${woff(700)}) format("woff2")}text{font-family:UM,monospace}</style>
<rect width="${W}" height="${H}" fill="${bg}"/>${art(M, 1080, W - 2 * M, 1000)}${type}</svg>\n`;
}

/** 1,000 dots, one per day, as a notebook dot grid. */
function grid(x0, y0, w, h, cols = 40, rows = 25) {
  const pts = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) pts.push([x0 + (c * w) / (cols - 1), y0 + (r * h) / (rows - 1)]);
  return pts;
}

/** Ordered on the left (the hand), scattering into the accent on the right (the machine). */
function centaurArt(seed, hand, machine) {
  return (x, y, w, h) => {
    const R = rng(seed);
    const seam = x + w * 0.45;
    return grid(x, y, w, h)
      .map(([px, py]) => {
        const t = Math.max(0, (px - seam) / (x + w - seam));
        const j = t ** 1.5 * 90;
        const nx = px + (R() - 0.5) * j;
        const ny = py + (R() - 0.5) * j;
        return `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${t > 0 ? 9 : 7.5}" fill="${t > 0 ? machine : hand}" opacity="${t > 0 ? 0.6 + t * 0.4 : 1}"/>`;
      })
      .join("");
  };
}

/** One real exchange from the book (Thinking): my turn in salmon, the reply as grey lines, the ··· gap. */
function exchangeArt(x, y, w) {
  const me = `<rect x="${x + 360}" y="${y + 40}" width="${w - 360}" height="300" rx="70" fill="${C.salmon}"/>
<rect x="${x + w - 100}" y="${y + 240}" width="100" height="100" fill="${C.salmon}"/>
${text(x + 430, y + 165, 66, C.ink, "ask me iqs if u need")}${text(x + 430, y + 260, 66, C.ink, "a human perspective")}`;
  const ai = `<rect x="${x}" y="${y + 420}" width="${w - 280}" height="380" rx="70" fill="#e4e0d8"/>
<rect x="${x}" y="${y + 700}" width="100" height="100" fill="#e4e0d8"/>
${[0, 1, 2].map((i) => `<rect x="${x + 75}" y="${y + 520 + i * 80}" width="${[820, 760, 560][i]}" height="30" rx="15" fill="#c9c4bb"/>`).join("")}`;
  const gap = `<g fill="${C.grey}">${[0, 1, 2].map((i) => `<circle cx="${x + 50 + i * 50}" cy="${y + 900}" r="14"/>`).join("")}</g>`;
  return me + ai + gap;
}

const variants = {
  /** Ink ground, paper dots turning salmon. */
  centaur: () => frame({ bg: C.ink, fg: C.paper, sub: C.grey, rule: C.salmon }, centaurArt(7, C.paper, C.salmon)),
  /** Salmon ground, ink type: the loudest on a shelf of thumbnails. */
  "centaur-salmon": () =>
    frame({ bg: C.salmon, fg: C.ink, sub: "#6e4f4c", rule: C.ink }, centaurArt(7, C.ink, C.paper)),
  /** Paper ground, the book's own form. */
  exchange: () => frame({ bg: C.paper, fg: C.ink, sub: "#6b6762", rule: C.salmon }, exchangeArt),
};

const pick = process.argv[2] ? [process.argv[2]] : Object.keys(variants);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
for (const name of pick) {
  const svg = variants[name]();
  writeFileSync(join(out, `${name}.svg`), svg);
  const html = join(out, `${name}.html`);
  writeFileSync(html, `<html><body style="margin:0">${svg}</body></html>`);
  execFileSync(chrome, ["--headless", "--disable-gpu", "--hide-scrollbars", `--window-size=${W},${H}`,
    `--screenshot=${join(out, `${name}.png`)}`, `file://${html}`], { stdio: "ignore" });
  console.log(`cover/out/${name}.png`);
}
