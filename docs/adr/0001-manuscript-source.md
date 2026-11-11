# ADR 0001: The website text is the manuscript

Status: accepted (2026-11-11)

## Context

Two versions of the text exist: the original book notes in this repo (`content/`) and the merged chapters on michellzappa.com (`content/field-notes/` in `michellzappa/blog`). The merged version puts the newsletter essays first, then the field exercise, the vignette and the notes the newsletter did not cover. MZ judged the newsletter text more polished.

## Decision

The merged website text is the manuscript. Edits for the book happen there first, so the website and the book stay one text. The build pipeline in this repo reads it.

## Consequences

- The website improves as the book is edited.
- Book-only material (front matter, acknowledgements) lives in this repo under `book/`.
