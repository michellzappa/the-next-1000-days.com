#!/usr/bin/env python3
"""
RSS Newsletter Fetcher

This script fetches the latest newsletter issues from the RSS feed and converts them
to markdown format, integrating seamlessly with the existing N-000.md collection.

Usage:
    python3 fetch_latest_newsletters.py

Features:
- Fetches latest issues from RSS feed
- Extracts issue numbers from titles
- Downloads HTML content from Substack
- Converts to markdown with consistent formatting
- Integrates with existing N-000.md naming system
- Skips already downloaded issues
"""

import os
import re
import json
import requests
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import xml.etree.ElementTree as ET
from urllib.parse import urljoin, urlparse
import html2text
from bs4 import BeautifulSoup
import time

# Configuration
RSS_FEED_URL = "https://newsletter.envisioning.io/feed.rss"
OUTPUT_DIR = Path("src/data/newsletter_posts/markdown")
METADATA_FILE = Path("src/data/newsletter_posts/rss_metadata.json")
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

# Create output directory if it doesn't exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

class RSSNewsletterFetcher:
    def __init__(self):
        self.html2text_converter = html2text.HTML2Text()
        self.html2text_converter.ignore_links = False
        self.html2text_converter.ignore_images = True
        self.html2text_converter.ignore_emphasis = False
        self.html2text_converter.body_width = 0
        self.html2text_converter.unicode_snob = True
        self.html2text_converter.escape_snob = True
        
        # Load existing metadata
        self.metadata = self.load_metadata()
        
    def load_metadata(self) -> Dict:
        """Load existing RSS metadata"""
        if METADATA_FILE.exists():
            with open(METADATA_FILE, 'r') as f:
                return json.load(f)
        return {
            "fetched_issues": {},
            "last_fetch": None
        }
    
    def save_metadata(self):
        """Save RSS metadata"""
        self.metadata["last_fetch"] = datetime.now().isoformat()
        with open(METADATA_FILE, 'w') as f:
            json.dump(self.metadata, f, indent=2)
    
    def extract_issue_number_from_title(self, title: str) -> Optional[int]:
        """Extract issue number from newsletter title"""
        # Look for patterns like "We are in service of the future (119)"
        match = re.search(r'\((\d+)\)', title)
        if match:
            return int(match.group(1))
        return None
    
    def fetch_rss_feed(self) -> List[Dict]:
        """Fetch and parse RSS feed"""
        try:
            print(f"Fetching RSS feed from {RSS_FEED_URL}")
            response = requests.get(RSS_FEED_URL, headers={'User-Agent': USER_AGENT})
            response.raise_for_status()
            
            # Parse XML
            root = ET.fromstring(response.content)
            
            # Find all items (newsletter posts)
            items = []
            for item in root.findall('.//item'):
                title_elem = item.find('title')
                link_elem = item.find('link')
                pub_date_elem = item.find('pubDate')
                
                if title_elem is not None and link_elem is not None:
                    title = title_elem.text
                    # Handle CDATA sections
                    if title_elem.text is None:
                        title = ''.join(title_elem.itertext())
                    
                    items.append({
                        'title': title,
                        'link': link_elem.text,
                        'pub_date': pub_date_elem.text if pub_date_elem is not None else None
                    })
            
            print(f"Found {len(items)} items in RSS feed")
            return items
            
        except Exception as e:
            print(f"Error fetching RSS feed: {e}")
            return []
    
    def get_existing_issue_numbers(self) -> set:
        """Get set of existing issue numbers from markdown files"""
        existing_numbers = set()
        for md_file in OUTPUT_DIR.glob("N-*.md"):
            # Extract number from filename like N-115.md
            match = re.search(r'N-(\d+)\.md', md_file.name)
            if match:
                existing_numbers.add(int(match.group(1)))
        return existing_numbers
    
    def fetch_article_content(self, url: str) -> Optional[str]:
        """Fetch HTML content of a newsletter article"""
        try:
            print(f"Fetching content from {url}")
            response = requests.get(url, headers={'User-Agent': USER_AGENT})
            response.raise_for_status()
            
            return response.text
            
        except Exception as e:
            print(f"Error fetching article content: {e}")
            return None
    
    def clean_html_content(self, html_content: str) -> str:
        """Clean and process HTML content"""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            # Remove Substack-specific elements
            for element in soup.find_all(class_=re.compile(r'(button|subscribe|social|share|comment|like|follow|author|publish-date)')):
                element.decompose()
            
            # Remove Substack navigation and branding
            for element in soup.find_all(class_=re.compile(r'(substack|post-header|post-meta)')):
                element.decompose()
            
            # Remove empty links and navigation elements
            for link in soup.find_all('a'):
                if link.get('href') in ['/', ''] or 'substack.com' in str(link.get('href', '')):
                    link.decompose()
            
            # Remove image containers but keep captions
            for img_container in soup.find_all(class_=re.compile(r'image|captioned-image')):
                caption = img_container.find(class_=re.compile(r'caption'))
                if caption and caption.get_text().strip():
                    img_container.replace_with(caption)
                else:
                    img_container.decompose()
            
            # Remove embedded posts
            for embedded in soup.find_all(class_=re.compile(r'embedded-post')):
                embedded.decompose()
            
            # Find the main content area
            main_content = soup.find('div', class_=re.compile(r'post-content|entry-content'))
            if main_content:
                return str(main_content)
            
            return str(soup)
        except Exception as e:
            print(f"Error cleaning HTML: {e}")
            return html_content
    
    def convert_html_to_markdown(self, html_content: str, issue_number: int) -> str:
        """Convert HTML content to markdown"""
        try:
            # Clean the HTML first
            cleaned_html = self.clean_html_content(html_content)
            
            # Convert to markdown
            markdown_content = self.html2text_converter.handle(cleaned_html)
            
            # Clean up the markdown
            lines = markdown_content.split('\n')
            cleaned_lines = []
            footer_started = False
            
            for line in lines:
                line = line.strip()
                
                # Check if we've hit the footer section
                if 'If Artificial Insights makes sense to you' in line:
                    footer_started = True
                    break
                
                # Skip empty links and Substack navigation elements
                if line in ['[](/)', '[](https://substack.com/@envisioningtech)']:
                    continue
                
                # Skip author and date lines that are redundant
                if line in ['[Michell Zappa](https://substack.com/@envisioningtech)', 'Sep 29, 2025', 'Sep 22, 2025', 'Apr 14, 2025']:
                    continue
                
                # Skip redundant title lines
                if line in ['# [Artificial Insights](/)', '# Artificial Insights']:
                    continue
                
                # Skip lines that are just the issue title repeated
                if re.match(r'# .*\(\d+\)', line) and line != f'# {issue_number:03d}':
                    continue
                
                if line:
                    # Remove excessive whitespace
                    line = re.sub(r'\s+', ' ', line)
                    # Fix common markdown issues
                    line = re.sub(r'\*\*\*\*+', '**', line)
                    line = re.sub(r'__+', '_', line)
                    # Remove escaped parentheses from titles
                    line = re.sub(r'\\([()])', r'\1', line)
                    cleaned_lines.append(line)
                elif cleaned_lines and cleaned_lines[-1]:
                    cleaned_lines.append('')
            
            # Remove trailing empty lines
            while cleaned_lines and not cleaned_lines[-1]:
                cleaned_lines.pop()
            
            # Create the final markdown content
            result_lines = [
                f"# {issue_number:03d}",
                "",
                *cleaned_lines
            ]
            
            return '\n'.join(result_lines)
            
        except Exception as e:
            print(f"Error converting HTML to markdown: {e}")
            return f"# {issue_number:03d}\n\n*Error converting content*"
    
    def process_newsletter_item(self, item: Dict, force_refresh: bool = False) -> bool:
        """Process a single newsletter item from RSS"""
        try:
            title = item['title']
            link = item['link']
            
            # Extract issue number
            issue_number = self.extract_issue_number_from_title(title)
            if not issue_number:
                print(f"Could not extract issue number from title: {title}")
                return False
            
            # Check if we already have this issue (unless forcing refresh)
            if not force_refresh and issue_number in self.metadata["fetched_issues"]:
                print(f"✓ Issue {issue_number} already exists, skipping")
                return True
            
            # Check if markdown file already exists (unless forcing refresh)
            output_filename = f"N-{issue_number:03d}.md"
            output_path = OUTPUT_DIR / output_filename
            if not force_refresh and output_path.exists():
                print(f"✓ Issue {issue_number} markdown file already exists, skipping")
                self.metadata["fetched_issues"][issue_number] = {
                    "title": title,
                    "link": link,
                    "fetched_at": datetime.now().isoformat(),
                    "output_file": output_filename
                }
                return True
            
            # Fetch article content
            html_content = self.fetch_article_content(link)
            if not html_content:
                return False
            
            # Convert to markdown
            markdown_content = self.convert_html_to_markdown(html_content, issue_number)
            
            # Write markdown file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            # Update metadata
            self.metadata["fetched_issues"][issue_number] = {
                "title": title,
                "link": link,
                "fetched_at": datetime.now().isoformat(),
                "output_file": output_filename
            }
            
            print(f"✓ Processed issue {issue_number}: {title} -> {output_filename}")
            return True
            
        except Exception as e:
            print(f"✗ Error processing newsletter item: {e}")
            return False
    
    def run(self, force_refresh: bool = False):
        """Run the RSS fetching process"""
        print("Starting RSS newsletter fetch...")
        print(f"Output directory: {OUTPUT_DIR}")
        
        if force_refresh:
            print("Force refresh enabled - will reprocess existing files")
        
        # Fetch RSS feed
        items = self.fetch_rss_feed()
        if not items:
            print("No items found in RSS feed")
            return
        
        # Get existing issue numbers
        existing_numbers = self.get_existing_issue_numbers()
        print(f"Existing issues: {sorted(existing_numbers)}")
        
        # Process items
        processed_count = 0
        skipped_count = 0
        
        for item in items:
            issue_number = self.extract_issue_number_from_title(item['title'])
            if not issue_number:
                print(f"⚠ Skipping item without issue number: {item['title']}")
                skipped_count += 1
                continue
            
            # Skip if already processed and not forcing refresh
            if not force_refresh and issue_number in self.metadata["fetched_issues"]:
                output_filename = f"N-{issue_number:03d}.md"
                output_path = OUTPUT_DIR / output_filename
                if output_path.exists():
                    print(f"✓ Issue {issue_number} already exists, skipping")
                    skipped_count += 1
                    continue
            
            if self.process_newsletter_item(item, force_refresh):
                processed_count += 1
            else:
                skipped_count += 1
            
            # Be respectful to the server
            time.sleep(1)
        
        # Save metadata
        self.save_metadata()
        
        print(f"\nFetch complete!")
        print(f"Processed: {processed_count} new issues")
        print(f"Skipped: {skipped_count} issues")
        print(f"Total markdown files: {len(list(OUTPUT_DIR.glob('N-*.md')))}")

def main():
    """Main function"""
    fetcher = RSSNewsletterFetcher()
    
    # Check for command line arguments
    import sys
    force_refresh = "--force" in sys.argv or "-f" in sys.argv
    
    if force_refresh:
        print("Force refresh enabled - will reprocess existing files")
    
    fetcher.run(force_refresh=force_refresh)

if __name__ == "__main__":
    main()
