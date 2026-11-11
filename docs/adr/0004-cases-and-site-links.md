# ADR 0004: Cases as shared files, linked between book and site

Status: proposed, MZ decides

## Context

MZ's objective (BOOK.md) is a practical book full of real examples. The current chapters describe habits but show few cases. The site (michellzappa.com/field-notes) and the book must stay one text (ADR 0001), and a case must exist in one place only.

## Proposal

1. **One file per unit, stable id.** In `michellzappa/blog`:
   - `content/field-notes/<chapter>.md` keeps the essay, exercise and vignette.
   - `content/field-notes/notes/<id>.md`: one field note per file (for example `belief-examination`).
   - `content/field-notes/cases/<id>.md`: one real case per file. Frontmatter: `id`, `chapter`, `notes` (the note ids it backs), `date`, `project`, `links`. Body: task, what MZ did, what the AI did, result, lesson.
2. **Chapters reference by id, never copy.** A chapter lists its notes and cases by id. The site renders them as sections and case cards. The book build inlines the same files.
3. **Smart links.**
   - Every note and case has a permanent page: `michellzappa.com/field-notes/<chapter>#<id>` and `/field-notes/cases/<id>`.
   - Ebook: real hyperlinks to those pages.
   - Print: a short printed URL per case (for example `michellzappa.com/c/<id>`), with screenshots, prompts and repos on the web page. The print book stays readable without them.
4. **Output flags in frontmatter, not copies.** `book: false` or `web: false` hides a unit from one output. Book-only material (front matter) stays in `the-next-1000-days.com/book/` (ADR 0001).

## Consequences

- The site changes shape: field-note pages get case cards and new case pages. That is a code change in `michellzappa/blog`.
- Cases come only from MZ's real work. Agents propose candidate cases from sources MZ names; MZ approves each before it enters the text.
