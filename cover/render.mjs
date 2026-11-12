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

/**
 * Ordered dots (the hand) turning into scattered accent dots (the machine).
 * `mix(u, v, R)` says how far each dot has turned, 0 to 1, from its position
 * in the band (u across, v down, both 0 to 1). Each variant is a different mix.
 */
function centaurArt(seed, hand, machine, mix) {
  return (x, y, w, h) => {
    const R = rng(seed);
    return grid(x, y, w, h)
      .map(([px, py]) => {
        const t = Math.min(1, Math.max(0, mix((px - x) / w, (py - y) / h, R)));
        const j = t ** 1.5 * 90;
        const nx = px + (R() - 0.5) * j;
        const ny = py + (R() - 0.5) * j;
        return `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${t > 0 ? 9 : 7.5}" fill="${t > 0 ? machine : hand}" opacity="${t > 0 ? 0.6 + t * 0.4 : 1}"/>`;
      })
      .join("");
  };
}

/** Ways the hand turns into the machine. */
const MIX = {
  /** One straight seam. */
  seam: (u) => (u - 0.45) / 0.55,
  /** The seam runs on a slant, so the change starts lower left and ends upper right. */
  diagonal: (u, v) => (u + (1 - v) * 0.5 - 0.6) / 0.6,
  /** Each row turns at its own column: a ragged edge. */
  ragged: (() => {
    const R = rng(11);
    const at = Array.from({ length: 25 }, () => 0.2 + R() * 0.5);
    return (u, v) => (u - at[Math.round(v * 24)]) / (1 - at[Math.round(v * 24)]);
  })(),
  /** No edge: the chance that a dot has turned grows from left to right. */
  dither: (u, v, R) => (R() < u ** 1.6 ? 0.25 + u * 0.75 : 0),
  /** Time runs down the page: the first days in order, the later days loose. */
  days: (u, v) => (v - 0.3) / 0.7,
  /** A soft wave instead of a line. */
  wave: (u, v) => (u - (0.45 + 0.18 * Math.sin(v * Math.PI * 2.2))) / 0.45,
};

const ink = { bg: C.ink, fg: C.paper, sub: C.grey, rule: C.salmon };
const variants = {
  /** Ink ground, paper dots turning salmon; one variant per mix. */
  ...Object.fromEntries(
    Object.entries(MIX).map(([name, mix]) => [`dots-${name}`, () => frame(ink, centaurArt(7, C.paper, C.salmon, mix))]),
  ),
  /** Salmon ground, ink type: the loudest on a shelf of thumbnails. */
  "dots-dither-salmon": () =>
    frame({ bg: C.salmon, fg: C.ink, sub: "#6e4f4c", rule: C.ink }, centaurArt(7, C.ink, C.paper, MIX.dither)),
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
