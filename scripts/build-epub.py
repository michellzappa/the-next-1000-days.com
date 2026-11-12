#!/usr/bin/env python3
"""Build a test EPUB of the book from the live manuscript (issue #11, first step).

The manuscript is content/field-notes/*.md in the blog repo (ADR 0001). This script
joins the chapters in book order, turns "> **Me:** / > **AI:**" exchanges into
styled turns, and runs pandoc. Output: build/field-notes.epub (gitignored).

    python3 scripts/build-epub.py [--blog ../michellzappa.com]
"""
import argparse
import datetime
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TURN = re.compile(r"^>\s*\*\*(Me|AI)\b([^*]*):\*\*\s*(.*)$")

CSS = """
body { font-family: serif; line-height: 1.45; }
h1 { margin-top: 0; }
span.subtitle { font-style: italic; }
div.exchange { margin: 1em 0; }
div.exchange + div.exchange { border-top: 1px dashed #bbb; padding-top: 0.8em; }
div.me, div.ai, div.note { margin: 0.4em 0; padding: 0.35em 0.6em; border-radius: 0.6em; }
div.me { margin-left: 15%; background: #e8e8e8; }
div.ai { margin-right: 15%; border: 1px solid #bbb; }
div.gap { margin: 0.3em 0; color: #999; letter-spacing: 0.2em; }
div.note { text-align: center; font-size: 0.85em; color: #555; }
div.me p, div.ai p, div.note p { margin: 0.2em 0; text-indent: 0; }
span.who { font-size: 0.75em; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
div.exercise { border: 1px dashed #888; padding: 0.5em 0.9em; margin: 1em 0; }
"""


def split_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---\n"):
        return {}, text
    head, body = text[4:].split("\n---\n", 1)
    meta = {}
    for line in head.splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"')
    return meta, body


def exchange_to_divs(lines: list[str]) -> list[str]:
    """One quoted block of turns -> pandoc fenced divs, one per turn."""
    out = ["::: exchange"]
    current = None
    for raw in lines:
        m = TURN.match(raw.strip())
        if m:
            if current:
                out.append(":::")
            who, label, text = m.group(1), m.group(2).strip(" ()"), m.group(3)
            cls = "me" if who == "Me" else "ai"
            if cls == "me" and current == "me":
                out += ["::: gap", "···", ":::"]  # the model's reply is not shown
            out += [f"::: {cls}", f"[{who}{' ' + label if label else ''}]{{.who}}", "", text]
            current = cls
            continue
        text = re.sub(r"^\s*>\s?", "", raw)
        if current:
            out.append(text)
        elif text.strip():
            out += ["::: note", text, ":::"]
    if current:
        out.append(":::")
    out.append(":::")
    return out


WEB_ONLY = "<!-- web only -->"


def drop_web_only(body: str) -> str:
    """Cards marked web only stay on the site but not in the book (cut list, #9)."""
    head, sep, cards = body.partition("## More field notes")
    if not sep:
        return body
    parts = re.split(r"(?m)^(?=### )", cards)
    kept = [parts[0]] + [p for p in parts[1:] if WEB_ONLY not in p]
    return head + sep + "".join(kept)


def convert_body(body: str) -> str:
    body = drop_web_only(body)
    # Same token as the site (lib/book-text.ts): days since ChatGPT launched, at build time.
    days = (datetime.date.today() - datetime.date(2022, 11, 30)).days
    body = body.replace("%DAYS_SINCE_CHATGPT%", f"{days:,}")
    lines, out, block = body.splitlines(), [], []

    def flush():
        if not block:
            return
        if any(TURN.match(l.strip()) for l in block):
            out.extend([""] + exchange_to_divs(block) + [""])
        else:
            out.extend(block)
        block.clear()

    for line in lines:
        if re.match(r"^\s*>", line):
            block.append(line)
        else:
            flush()
            out.append(line)
    flush()
    md = "\n".join(out)
    md = md.replace("## More field notes", "## Field notes")
    # Field exercise: wrap the section body in a box (up to the next heading).
    md = re.sub(r"(### Field exercise\n)(.*?)(?=\n#{2,3} |\Z)",
                lambda m: m.group(1) + "\n::: exercise\n" + m.group(2).strip() + "\n:::\n",
                md, flags=re.S)
    # Chapter headings move down one level: chapter = h1.
    return re.sub(r"^(#{2,5}) ", lambda m: "#" + m.group(1) + " ", md, flags=re.M)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--blog", default=str(ROOT.parent / "michellzappa.com"))
    args = ap.parse_args()
    src = Path(args.blog) / "content" / "field-notes"
    # Intro first, then chapters by their frontmatter order (chapter 0 included).
    def order(f: Path) -> float:
        return float(split_frontmatter(f.read_text())[0].get("order", "0"))
    chapters = sorted((f for f in src.glob("*.md") if re.match(r"\d+-", f.name)), key=order)
    files = [src / "index.md", *chapters]

    book_meta, parts = {}, []
    for f in files:
        meta, body = split_frontmatter(f.read_text())
        if "⟦" in body:
            print(f"{f.name}: unapproved ⟦⟧ connector line", file=sys.stderr)
            return 1
        title = "Introduction" if f.name == "index.md" else meta["title"]
        if f.name == "index.md":
            book_meta = meta
        parts.append(f"# {title}\n\n")
        if f.name != "index.md" and meta.get("subtitle"):
            parts.append(f"[{meta['subtitle']}]{{.subtitle}}\n\n")
        parts.append(convert_body(body) + "\n\n")

    build = ROOT / "build"
    build.mkdir(exist_ok=True)
    (build / "manuscript.md").write_text("".join(parts))
    (build / "epub.css").write_text(CSS)
    (build / "metadata.yaml").write_text(
        f'title: "{book_meta["title"]}"\nsubtitle: "{book_meta.get("subtitle", "")}"\n'
        'author: "Michell Zappa"\nlang: en\n'
    )
    # Pandoc's markdown wraps <p class=subtitle> spans; a bracketed span is fine in EPUB.
    cmd = ["pandoc", "build/metadata.yaml", "build/manuscript.md",
           "-f", "markdown+fenced_divs+bracketed_spans-smart",
           "--toc", "--toc-depth=1", "--split-level=1",
           "--css", "build/epub.css", "-o", "build/field-notes.epub"]
    subprocess.run(cmd, check=True, cwd=ROOT)
    words = len(re.findall(r"\S+", "".join(parts)))
    print(f"build/field-notes.epub  ({words} words incl. headings, ~{words // 250} print pages at 6x9)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
