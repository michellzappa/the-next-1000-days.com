# ADR 0005: Cover direction, the ragged dot grid

Status: accepted (2026-11-12, MZ: "dots-ragged is the one")

## Context

BOOK.md makes the cover MZ's decision. MZ asked for a cover in the spirit of Stripe Press, then for a business-book layout ("too terse imo, think business books"), then for dot variations where the colour does not switch on one column.

## Decision

- Layout: the subtitle as a small line on top, the title in bold Ubuntu Mono capitals across the full width, one image band, a short accent rule, the author name in bold at the foot.
- Image: `dots-ragged`. 1,000 dots, one per day, in a 40 x 25 grid. Ordered paper-white dots (the hand) turn into scattered salmon dots (the machine); each row turns at its own column.
- Colours: ink #111010 ground, paper #f4f1ea type, salmon #f2b8b4 accent. Type: Ubuntu Mono 400 and 700, the site face.
- Source: `cover/render.mjs` (`node cover/render.mjs dots-ragged`). Ebook size 1600 x 2560. The print wrap (spine, back) comes with the PDF build (#11).

## Rejected

Path (one line through the dots), exchange (a chat on paper), and the other dot mixes (seam, diagonal, dither, days, wave, salmon ground).

## Open

- Dots that have only just turned read as muddy brown on ink. Fix before final export.
- The chapter images (in progress) share this motif.
