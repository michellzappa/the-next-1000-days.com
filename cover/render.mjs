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
 * SVG by default; --png renders PNGs with headless Chrome (ask mz first on his laptop).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { MIX, turn } from "../../michellzappa.com/scripts/charts/dots.mjs";

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

/**
 * Ordered dots (the hand) turning into scattered accent dots (the machine).
 * The dot motif (grid, mixes, turn) lives in the site repo, the one source of
 * truth shared with the chapter images: michellzappa.com/scripts/charts/dots.mjs.
 */
function centaurArt(seed, hand, machine, mix) {
  return (x, y, w, h) =>
    turn(x, y, w, h, { seed, mix })
      .map(({ x: nx, y: ny, t }) =>
        `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${t > 0 ? 9 : 7.5}" fill="${t > 0 ? machine : hand}" opacity="${t > 0 ? 0.6 + t * 0.4 : 1}"/>`)
      .join("");
}

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

// PNGs need headless Chrome, which makes the Dock jump on mz's laptop: only with --png, and
// only when mz asked for a PNG (or run it on mini-4p). SVG is the default output.
const png = process.argv.includes("--png");
const args = process.argv.slice(2).filter((a) => a !== "--png");
const pick = args[0] ? [args[0]] : Object.keys(variants);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
for (const name of pick) {
  const svg = variants[name]();
  writeFileSync(join(out, `${name}.svg`), svg);
  if (!png) {
    console.log(`cover/out/${name}.svg`);
    continue;
  }
  const html = join(out, `${name}.html`);
  writeFileSync(html, `<html><body style="margin:0">${svg}</body></html>`);
  execFileSync(chrome, ["--headless", "--disable-gpu", "--hide-scrollbars", `--window-size=${W},${H}`,
    `--screenshot=${join(out, `${name}.png`)}`, `file://${html}`], { stdio: "ignore" });
  console.log(`cover/out/${name}.png`);
}
