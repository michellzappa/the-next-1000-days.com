#!/usr/bin/env python3
"""
Newsletter HTML to Markdown Converter

This script converts HTML newsletter files to markdown format with sequential naming.
It extracts plain text content from HTML files, preserving structure but removing
images, styling, and other non-essential elements.

Usage:
    python convert_newsletters.py

Features:
- Extracts text content from HTML files
- Creates sequential naming (N001.md, N002.md, etc.)
- Handles missing numbers in filenames
- Re-runnable with incremental updates
- Preserves basic markdown structure
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import html2text
from bs4 import BeautifulSoup

# Configuration
HTML_DIR = Path("src/data/newsletter_posts/html")
OUTPUT_DIR = Path("src/data/newsletter_posts/markdown")
METADATA_FILE = Path("src/data/newsletter_posts/conversion_metadata.json")

# Create output directory if it doesn't exist
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

class NewsletterConverter:
    def __init__(self):
        self.html2text_converter = html2text.HTML2Text()
        self.html2text_converter.ignore_links = False  # Keep links but as plain text
        self.html2text_converter.ignore_images = True
        self.html2text_converter.ignore_emphasis = False
        self.html2text_converter.body_width = 0  # Don't wrap lines
        self.html2text_converter.unicode_snob = True
        self.html2text_converter.escape_snob = True
        
        # Load existing metadata
        self.metadata = self.load_metadata()
        
    def load_metadata(self) -> Dict:
        """Load existing conversion metadata"""
        if METADATA_FILE.exists():
            with open(METADATA_FILE, 'r') as f:
                return json.load(f)
        return {
            "processed_files": {},
            "next_number": 1,
            "last_updated": None
        }
    
    def save_metadata(self):
        """Save conversion metadata"""
        self.metadata["last_updated"] = datetime.now().isoformat()
        with open(METADATA_FILE, 'w') as f:
            json.dump(self.metadata, f, indent=2)
    
    def extract_number_from_filename(self, filename: str) -> Optional[int]:
        """Extract newsletter number from filename"""
        # Look for pattern like -007.html, -008.html, etc.
        match = re.search(r'-(\d{3})\.html$', filename)
        if match:
            return int(match.group(1))
        return None
    
    def get_newsletter_title(self, html_content: str) -> str:
        """Extract title from HTML content"""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            # Try to find title in various places
            title = soup.find('title')
            if title:
                return title.get_text().strip()
            
            # Look for h1 or other heading tags
            h1 = soup.find('h1')
            if h1:
                return h1.get_text().strip()
                
            # Fallback: use filename
            return "Newsletter"
        except:
            return "Newsletter"
    
    def clean_html_content(self, html_content: str) -> str:
        """Clean and process HTML content"""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            # Remove Substack-specific elements that are not content
            for element in soup.find_all(class_=re.compile(r'(button|subscribe|social|share|comment|like|follow)')):
                element.decompose()
            
            # Remove image containers but keep captions if they're meaningful
            for img_container in soup.find_all(class_=re.compile(r'image|captioned-image')):
                # Try to preserve captions that might be meaningful
                caption = img_container.find(class_=re.compile(r'caption'))
                if caption and caption.get_text().strip():
                    # Replace image container with just the caption
                    img_container.replace_with(caption)
                else:
                    img_container.decompose()
            
            # Remove embedded posts (Substack cross-posts)
            for embedded in soup.find_all(class_=re.compile(r'embedded-post')):
                embedded.decompose()
            
            return str(soup)
        except Exception as e:
            print(f"Error cleaning HTML: {e}")
            return html_content
    
    def convert_html_to_markdown(self, html_content: str, filename: str) -> str:
        """Convert HTML content to markdown"""
        try:
            # Clean the HTML first
            cleaned_html = self.clean_html_content(html_content)
            
            # Convert to markdown
            markdown_content = self.html2text_converter.handle(cleaned_html)
            
            # Get newsletter number for title
            number = self.get_newsletter_number(filename)
            
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
                
                if line:
                    # Remove excessive whitespace
                    line = re.sub(r'\s+', ' ', line)
                    # Fix common markdown issues
                    line = re.sub(r'\*\*\*\*+', '**', line)  # Fix multiple asterisks
                    line = re.sub(r'__+', '_', line)  # Fix multiple underscores
                    cleaned_lines.append(line)
                elif cleaned_lines and cleaned_lines[-1]:  # Only add empty lines between content
                    cleaned_lines.append('')
            
            # Remove trailing empty lines
            while cleaned_lines and not cleaned_lines[-1]:
                cleaned_lines.pop()
            
            # Create the final markdown content with issue number as title
            result_lines = [
                f"# {number:03d}",
                "",
                *cleaned_lines
            ]
            
            return '\n'.join(result_lines)
            
        except Exception as e:
            print(f"Error converting HTML to markdown for {filename}: {e}")
            return f"# 001\n\n*Error converting content from {filename}*"
    
    def get_newsletter_number(self, filename: str) -> int:
        """Get or assign newsletter number"""
        # Check if we've already assigned a number for this file
        if filename in self.metadata["processed_files"]:
            return self.metadata["processed_files"][filename]["number"]
        
        # Try to extract number from filename
        extracted_number = self.extract_number_from_filename(filename)
        if extracted_number:
            return extracted_number
        
        # This shouldn't happen with the new logic, but fallback
        return self.metadata["next_number"]
    
    def process_markdown_file(self, markdown_file: Path) -> bool:
        """Process a single markdown file to remove footer"""
        try:
            # Read markdown content
            with open(markdown_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Split into lines and remove footer
            lines = content.split('\n')
            cleaned_lines = []
            
            for line in lines:
                # Check if we've hit the footer section
                if 'If Artificial Insights makes sense to you' in line:
                    break
                cleaned_lines.append(line)
            
            # Remove trailing empty lines
            while cleaned_lines and not cleaned_lines[-1].strip():
                cleaned_lines.pop()
            
            # Write cleaned content back
            cleaned_content = '\n'.join(cleaned_lines)
            with open(markdown_file, 'w', encoding='utf-8') as f:
                f.write(cleaned_content)
            
            print(f"✓ Cleaned footer from {markdown_file.name}")
            return True
            
        except Exception as e:
            print(f"✗ Error processing {markdown_file.name}: {e}")
            return False
    
    def process_html_file(self, html_file: Path) -> bool:
        """Process a single HTML file"""
        try:
            # Read HTML content
            with open(html_file, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # Get newsletter number
            number = self.get_newsletter_number(html_file.name)
            
            # Convert to markdown
            markdown_content = self.convert_html_to_markdown(html_content, html_file.name)
            
            # Create output filename
            output_filename = f"N-{number:03d}.md"
            output_path = OUTPUT_DIR / output_filename
            
            # Write markdown file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            # Update metadata
            self.metadata["processed_files"][html_file.name] = {
                "number": number,
                "output_file": output_filename,
                "processed_at": datetime.now().isoformat(),
                "file_size": html_file.stat().st_size
            }
            
            print(f"✓ Processed {html_file.name} -> {output_filename}")
            return True
            
        except Exception as e:
            print(f"✗ Error processing {html_file.name}: {e}")
            return False
    
    def clean_existing_markdown_files(self):
        """Clean existing markdown files to remove footers"""
        print("Cleaning existing markdown files...")
        print(f"Output directory: {OUTPUT_DIR}")
        
        if not OUTPUT_DIR.exists():
            print(f"Error: Output directory {OUTPUT_DIR} does not exist")
            return
        
        # Get all markdown files
        markdown_files = sorted([f for f in OUTPUT_DIR.glob("N-*.md")])
        
        if not markdown_files:
            print("No markdown files found")
            return
        
        print(f"Found {len(markdown_files)} markdown files")
        
        processed_count = 0
        
        for markdown_file in markdown_files:
            if self.process_markdown_file(markdown_file):
                processed_count += 1
        
        print(f"\nCleaning complete!")
        print(f"Processed: {processed_count} files")
    
    def run(self, force_reprocess: bool = False):
        """Run the conversion process"""
        print("Starting newsletter conversion...")
        print(f"HTML directory: {HTML_DIR}")
        print(f"Output directory: {OUTPUT_DIR}")
        
        if not HTML_DIR.exists():
            print(f"Error: HTML directory {HTML_DIR} does not exist")
            return
        
        # Get all HTML files, sorted by filename (which should be chronological)
        html_files = sorted([f for f in HTML_DIR.glob("*.html")])
        
        if not html_files:
            print("No HTML files found")
            return
        
        print(f"Found {len(html_files)} HTML files")
        
        # Reset numbering for clean processing
        if force_reprocess:
            self.metadata["processed_files"] = {}
            self.metadata["next_number"] = 1
        
        # First pass: collect all explicit numbers
        explicit_numbers = set()
        files_with_explicit_numbers = []
        files_without_numbers = []
        
        for html_file in html_files:
            extracted_number = self.extract_number_from_filename(html_file.name)
            if extracted_number:
                explicit_numbers.add(extracted_number)
                files_with_explicit_numbers.append((html_file, extracted_number))
            else:
                files_without_numbers.append(html_file)
        
        # Sort files with explicit numbers by their number
        files_with_explicit_numbers.sort(key=lambda x: x[1])
        
        # Sort files without numbers by filename (chronological)
        files_without_numbers.sort(key=lambda x: x.name)
        
        # Assign numbers to files without explicit numbers
        current_number = 1
        for html_file in files_without_numbers:
            while current_number in explicit_numbers:
                current_number += 1
            # Assign this number
            self.metadata["processed_files"][html_file.name] = {
                "number": current_number,
                "assigned": True
            }
            current_number += 1
        
        processed_count = 0
        skipped_count = 0
        
        # Process all files in chronological order
        all_files = [(f, n) for f, n in files_with_explicit_numbers] + [(f, self.metadata["processed_files"][f.name]["number"]) for f in files_without_numbers]
        all_files.sort(key=lambda x: x[0].name)  # Sort by filename for chronological processing
        
        for html_file, assigned_number in all_files:
            # Skip if already processed and not forcing reprocess
            if (not force_reprocess and 
                html_file.name in self.metadata["processed_files"] and
                "output_file" in self.metadata["processed_files"][html_file.name] and
                (OUTPUT_DIR / self.metadata["processed_files"][html_file.name]["output_file"]).exists()):
                print(f"- Skipping {html_file.name} (already processed)")
                skipped_count += 1
                continue
            
            if self.process_html_file(html_file):
                processed_count += 1
        
        # Save metadata
        self.save_metadata()
        
        print(f"\nConversion complete!")
        print(f"Processed: {processed_count} files")
        print(f"Skipped: {skipped_count} files")
        print(f"Total markdown files: {len(list(OUTPUT_DIR.glob('N-*.md')))}")

def main():
    """Main function"""
    converter = NewsletterConverter()
    
    # Check for command line arguments
    import sys
    force_reprocess = "--force" in sys.argv or "-f" in sys.argv
    clean_only = "--clean" in sys.argv or "-c" in sys.argv
    
    if clean_only:
        print("Clean-only mode - will remove footers from existing markdown files")
        converter.clean_existing_markdown_files()
    else:
        if force_reprocess:
            print("Force reprocessing enabled - will reprocess all files")
        converter.run(force_reprocess=force_reprocess)

if __name__ == "__main__":
    main()
