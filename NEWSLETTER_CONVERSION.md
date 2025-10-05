# Newsletter HTML to Markdown Converter

This Python script converts HTML newsletter files from your Substack to clean markdown format for local storage and in-context use.

## Features

- **Extracts clean text content** from HTML files, removing images, styling, and non-essential elements
- **Sequential naming** with N-001.md, N-002.md, etc. format
- **Smart numbering logic** that handles explicit numbers in filenames and assigns sequential numbers for files without them
- **Incremental updates** - only processes new or changed files on subsequent runs
- **Re-runnable** - safe to run multiple times without re-downloading everything
- **Preserves structure** - maintains headings, links, and basic markdown formatting

## Setup

1. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Ensure your HTML files are in `src/data/newsletter_posts/html/`

## Usage

### Basic Usage

```bash
python3 convert_newsletters.py
```

### Force Reprocess All Files

```bash
python3 convert_newsletters.py --force
```

### Clean Existing Markdown Files (Remove Footers)

```bash
python3 convert_newsletters.py --clean
```

## Output

- **Markdown files**: `src/data/newsletter_posts/markdown/N-001.md`, `N-002.md`, etc.
- **Metadata**: `src/data/newsletter_posts/conversion_metadata.json` (tracks processing status)

## How It Works

1. **Numbering Logic**:

   - Files with explicit numbers (e.g., `-007.html`) use those numbers
   - Files without numbers get assigned sequential numbers, avoiding conflicts
   - All files are processed in chronological order (by filename timestamp)

2. **Content Cleaning**:

   - Removes Substack-specific elements (buttons, social links, embedded posts)
   - Strips images but preserves meaningful captions
   - Converts HTML to clean markdown format
   - Preserves links as plain text
   - Removes footer sections (everything after "If Artificial Insights makes sense to you")

3. **Incremental Processing**:
   - Tracks processed files in metadata
   - Skips already processed files unless `--force` is used
   - Updates only new or changed content

## File Structure

```
src/data/newsletter_posts/
├── html/                    # Input HTML files
│   ├── 116156688.ai-is-having-a-moment-001.html
│   ├── 117611579.as-an-ai-language-model-002.html
│   └── ...
├── markdown/               # Output markdown files
│   ├── N-001.md
│   ├── N-002.md
│   └── ...
└── conversion_metadata.json # Processing metadata
```

## Adding New Newsletters

1. Add new HTML files to `src/data/newsletter_posts/html/`
2. Run the script: `python3 convert_newsletters.py`
3. New files will be automatically processed and numbered

## Troubleshooting

- **Missing numbers**: Files without explicit numbers get auto-assigned sequential numbers
- **Duplicate numbers**: The script prevents conflicts by checking existing assignments
- **Force reprocess**: Use `--force` flag to reprocess all files if needed

## Example Output

Each markdown file contains:

- Issue number as the main title (e.g., # 001)
- Clean text content with preserved structure
- Links converted to plain text format

```markdown
# 001

Newsletter content here with proper markdown formatting...

## Section Headers

- Bullet points
- **Bold text**
- [Links as plain text]
```
