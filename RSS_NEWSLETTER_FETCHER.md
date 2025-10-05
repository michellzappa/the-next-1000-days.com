# RSS Newsletter Fetcher

This Python script automatically fetches the latest newsletter issues from your RSS feed and converts them to markdown format, seamlessly integrating with your existing N-000.md collection.

## Features

- **Automatic RSS Detection**: Fetches latest issues from `https://newsletter.envisioning.io/feed.rss`
- **Smart Issue Numbering**: Extracts issue numbers from titles like "We are in service of the future (119)"
- **HTML to Markdown Conversion**: Converts Substack HTML to clean markdown format
- **Seamless Integration**: Works with existing N-000.md naming system
- **Incremental Updates**: Only fetches new issues, skips existing ones
- **Force Refresh**: Option to reprocess existing files with improved cleaning
- **Clean Content**: Removes Substack navigation, footers, and redundant elements

## Setup

1. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Ensure your existing markdown files are in `src/data/newsletter_posts/markdown/`

## Usage

### Fetch New Issues Only

```bash
python3 fetch_latest_newsletters.py
```

### Force Refresh All Issues

```bash
python3 fetch_latest_newsletters.py --force
```

## How It Works

1. **RSS Feed Parsing**: Fetches and parses the RSS feed from your newsletter
2. **Issue Number Extraction**: Extracts issue numbers from titles using pattern matching
3. **Content Fetching**: Downloads HTML content from individual newsletter URLs
4. **HTML Cleaning**: Removes Substack-specific elements, navigation, and footers
5. **Markdown Conversion**: Converts clean HTML to markdown format
6. **File Integration**: Saves files as N-115.md, N-116.md, etc. to match existing naming

## Content Cleaning

The script automatically removes:

- Substack navigation elements
- Author and date metadata (redundant with issue numbers)
- Footer sections ("If Artificial Insights makes sense to you...")
- Empty links and navigation elements
- Redundant title repetitions
- Image containers (while preserving meaningful captions)

## Output

- **Markdown files**: `N-115.md`, `N-116.md`, `N-117.md`, etc.
- **Metadata**: `src/data/newsletter_posts/rss_metadata.json` (tracks fetched issues)
- **Consistent formatting**: All files follow the same clean format

## Integration with Existing System

The RSS fetcher works perfectly with your existing newsletter conversion system:

1. **Original HTML files**: Use `convert_newsletters.py` for historical HTML files
2. **Latest issues**: Use `fetch_latest_newsletters.py` for ongoing RSS updates
3. **Clean footers**: Use `convert_newsletters.py --clean` to remove footers from all files

## Example Workflow

```bash
# Initial setup: Convert historical HTML files
python3 convert_newsletters.py --force

# Clean footers from all files
python3 convert_newsletters.py --clean

# Fetch latest issues from RSS
python3 fetch_latest_newsletters.py

# Force refresh if you want to improve existing files
python3 fetch_latest_newsletters.py --force
```

## File Structure

```
src/data/newsletter_posts/
├── markdown/               # All newsletter files (N-001.md to N-119.md)
├── conversion_metadata.json # HTML conversion tracking
└── rss_metadata.json      # RSS fetch tracking
```

## Troubleshooting

- **Rate Limiting**: The script includes 1-second delays between requests
- **Missing Issues**: Check RSS feed URL and network connectivity
- **Formatting Issues**: Use `--force` to reprocess files with improved cleaning
- **Duplicate Content**: The script automatically skips existing issues

## Future Updates

To keep your collection current:

1. Run `python3 fetch_latest_newsletters.py` weekly
2. The script will automatically detect and fetch only new issues
3. All new content follows the same clean, consistent format

Your newsletter collection will stay complete and up-to-date with minimal effort! 🚀
