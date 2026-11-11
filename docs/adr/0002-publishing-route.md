# ADR 0002: Publishing route

Status: accepted (2026-11-11)

## Context

The goal is "author of" with an ISBN, fast, while keeping rights and pricing. Options considered:

1. Self-publish, print on demand, own ISBN.
2. Small independent publisher in the Netherlands or Brazil.
3. Free ebook plus paid print.

## Decision

1. **Route:** self-publish, print on demand (option 1).
   - Amazon: KDP for the ebook and the paperback.
   - Bookstores and libraries: IngramSpark or Draft2Digital Print, with the same own ISBN.
2. **ISBN:** own ISBNs from the Dutch ISBN agency (ISBN Nederland), a block of 10. MZ's Dutch business is the publisher of record. The ebook and the print edition each get their own ISBN. The rest of the block covers the Portuguese edition and later formats.
3. **Ebook list price:** USD 9.99. The print price follows when the page count and print cost are known (issue #11).

## Consequences

- MZ buys the ISBN block. Agents cannot do purchases.
- Before the first upload, decide the order of upload to KDP and Ingram. If KDP lists a paperback ISBN first, Amazon can suppress the Ingram listing of that ISBN. Record the order in issue #14.
- A small publisher (option 2) stays open for the Portuguese edition (ADR 0003).
