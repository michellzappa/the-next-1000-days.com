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

## How agents work here

- One issue at a time. Each issue states its acceptance test.
- Human-facing copy goes through the humanizer skill. No em dashes in the book text.
- Cases in the text carry no dates or years unless the timing is the point ("six weeks later", "tools that did not exist two years earlier"). Dates stay in the case bank as sources, not in the prose.
- Chapter shape: essay, callouts (field exercise, vignette), then field-note cards. Each card is titled by its moment (a short quote or scene, e.g. "My whole CRM is like 1MB"); the practice name goes in the italic subtitle. Each card: what happened, then one "Try it" line.
- At least one card per chapter shows the real exchange as dialogue (> **Me:** / > **AI:**), quoted from the source, typos kept, trimmed with an ellipsis or a bracketed note, never reworded.
- Never invent anecdotes, quotes or numbers. If a chapter needs one, ask in the issue.
- Decisions that cost money or are public (publisher, price, ISBN route, cover) are MZ's. Record them as ADRs.
