# Field Notes from a Centaur: the book

## Goal

Publish *Field Notes from a Centaur* as a book with an ISBN: an ebook and a print-on-demand edition. The book makes Michell Zappa "the author of" in every bio, event page and pitch.

## Objective

The book is practical. A reader learns how MZ works with AI from concrete examples of things MZ has done: what the task was, what MZ did, what the AI did, what came out, and what MZ learned. Every chapter is mostly cases, not abstract description. The book is readable by humans first.

A field note that only describes a habit ("I use AI to reason through ethical dilemmas") is not done until it has at least one real case behind it.

## Scope

- Seven chapters (Thinking, Creating, Building, Deciding, Organizing, Living, Connecting), an introduction and an afterword (Seven principles, The next thousand days).
- Each chapter: the essay, the field exercise, the vignette, the field notes, and the cases behind them (see ADR 0004).
- English first. A Portuguese edition follows (see ADR 0003).

## Source of truth

The merged text in the website repo (`michellzappa/blog`, `content/field-notes/*.md`) is the manuscript. See ADR 0001. This repo holds the original notes, the build pipeline and the book files.

## Definition of done

1. Manuscript edited: every field note backed by at least one real case, no newsletter framing, no broken sentences from the em-dash removal, consistent voice.
2. Front and back matter written: title page, copyright page, contents, introduction, acknowledgements, about the author.
3. EPUB and print PDF build from the manuscript with one command.
4. Cover designed for ebook and print.
5. ISBN assigned and the book listed on at least one store.
6. Book page on michellzappa.com with buy links, announced in Artificial Insights.

## Milestones

| Milestone | Done when |
|---|---|
| M1 Manuscript | Every chapter passes the edit checklist (issue per chapter). |
| M2 Book files | EPUB and print PDF build from the manuscript, cover in place. |
| M3 Publish | ISBN, store listing, book page, announcement. |
| M4 Portuguese edition | Separate milestone, starts after M3. |

## Local preview

Drafts live in `private/drafts/field-notes/<n>-<slug>.md` (gitignored), with the same filename as the published chapter. Run the michellzappa.com dev server (`pnpm dev` in ~/Dev/michellzappa.com, or the "field-notes" preview, port 3005). In dev, a draft replaces the published file, so http://localhost:3005/field-notes/<slug> shows it in the real layout. Reload to see edits. Production builds never read drafts. Going live = copy the draft into the blog repo's content/field-notes/.

## How agents work here

- One issue at a time. Each issue states its acceptance test.
- Human-facing copy goes through the humanizer skill. No em dashes in the book text.
- Cases in the text carry no dates or years unless the timing is the point ("six weeks later", "tools that did not exist two years earlier"). Dates stay in the case bank as sources, not in the prose.
- Chapter shape: essay, callouts (field exercise, vignette), then field-note cards. Each card is titled by its moment (a short quote or scene, e.g. "My whole CRM is like 1MB"); the practice name goes in the italic subtitle. Each card: what happened, then one "Try it" line.
- At least one card per chapter shows the real exchange as dialogue (> **Me:** / > **AI:**), quoted from the source, typos kept, trimmed with an ellipsis or a bracketed note, never reworded.
- **Your words first (MZ, 2026-11-11).** Prose is built from sentences MZ already wrote or said: newsletter text, his talks and calls (Granola, microphone channel only), his own chat messages. Agent-written words are connective tissue only: as few as possible, and marked in the draft with ⟦double brackets⟧ so MZ can see them. Light edits to spoken text are allowed (cut fillers, fix grammar, join fragments), but the wording stays his. Typos in quoted chat messages stay.
- **Contain claudisms (MZ, 2026-11-12).** MZ reads agent prose as "claudish" and cuts it. So: no card subtitles or one-line morals under titles, no signposting ("This chapter is about…", "This one is the map"), no agent-written section or page subtitles. When MZ's own words are missing, leave the gap or ask for a talk (#20, #23) instead of filling it. A chapter of only his exchanges is acceptable for now (Delegating, 2026-11-12).
- **Public, not private (MZ, 2026-11-12).** Exchanges stay true but reveal nothing internal. (1) Swap identifying specifics for neutral brackets inside quotes: [our tool], [a client], [a partner], [a colleague], [my CRM], [a programme page]; no client fees or Envisioning's own prices, no named people or institutions, no internal tools or client work. Generic numbers may stay: public consumer prices, the AI's market estimates, MZ's own small purchases, when the number is the point of the story. (2) Cut each exchange to the turning point: the 2 to 4 lines where something changes. (3) MZ's public projects stay named: Starlings, Bipe, Septena, Headroom, tinyarcana, LoFi Air, the Artificial Insights newsletter and community, his workshops. Signals sales, the CRM, clients, partners, pricing and private life are generalized.
- Anything MZ typed to an AI (or the AI typed back) is written as a **Me:** / **AI:** line, so the site shows it as chat, even a single line. Spoken and written passages stay plain quotes or prose. No exclamation marks added to headings.
- A tool or product a general reader may not know (Granola, Obsidian, Cursor, OpenClaw…) gets a short gloss in brackets at its first prose mention in each chapter. Connective lines are first person (I), never "Michell".
- Never invent anecdotes, quotes or numbers. If a chapter needs one, ask in the issue.
- Decisions that cost money or are public (publisher, price, ISBN route, cover) are MZ's. Record them as ADRs.
