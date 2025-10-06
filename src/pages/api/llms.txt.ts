import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getMainPageNumber } from '../../utils/pageNumbers';

const contentDir = path.join(process.cwd(), 'content');

// unified in utils/pageNumbers

// Function to read all content recursively
function getAllContent(): string {
  let fullText = '';
  
  try {
    // Read all chapter directories
    const chapterDirs = fs.readdirSync(contentDir)
      .filter(dir => /^\d{2}-/.test(dir))
      .sort(); // Sort to maintain order

    for (const chapterDir of chapterDirs) {
      const chapterId = chapterDir.split('-')[0];
      const chapterName = chapterDir.split('-').slice(1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
      const chapterPath = path.join(contentDir, chapterDir);
      
      // Add chapter header
      fullText += `\n\n# CHAPTER ${chapterId}: ${chapterName}\n`;
      fullText += `${'='.repeat(50)}\n\n`;

      // Get main page content
      const mainPageNumber = getMainPageNumber(chapterId);
      const mainFile = fs.readdirSync(chapterPath).find(file => file.startsWith(`${mainPageNumber}.`));
      
      if (mainFile) {
        try {
          const mainFilePath = path.join(chapterPath, mainFile);
          const mainContent = fs.readFileSync(mainFilePath, 'utf-8');
          
          // Add canonical page number
          fullText += `[${mainPageNumber}]\n\n`;
          
          // Clean up the content (remove frontmatter if any)
          const cleanContent = mainContent.replace(/^---[\s\S]*?---\n/, '');
          fullText += cleanContent.trim() + '\n\n';
        } catch (error) {
          console.error(`Error reading main file for chapter ${chapterId}:`, error);
        }
      }

      // Get all other pages in the chapter
      const allFiles = fs.readdirSync(chapterPath)
        .filter(file => file.endsWith('.md') && !file.startsWith(`${mainPageNumber}.`))
        .sort((a, b) => {
          const aNum = parseInt(a.split('.')[0]);
          const bNum = parseInt(b.split('.')[0]);
          return aNum - bNum;
        });

      for (const file of allFiles) {
        try {
          const filePath = path.join(chapterPath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Get the page number from filename
          const pageNumber = file.replace('.md', '');
          
          // Clean up the content (remove frontmatter if any)
          const cleanContent = content.replace(/^---[\s\S]*?---\n/, '');
          
          if (cleanContent.trim()) {
            // Add canonical page number
            fullText += `[${pageNumber}]\n\n`;
            fullText += cleanContent.trim() + '\n\n';
          }
        } catch (error) {
          console.error(`Error reading file ${file} in chapter ${chapterId}:`, error);
        }
      }
    }

    // Add metadata header
    const metadata = `# Field Notes from a Centaur - Complete Text
Generated: ${new Date().toISOString()}
Source: https://field-notes.centaur-labs.io

This document contains the complete text of "Field Notes from a Centaur: Learnings from one thousand days using AI."

Table of Contents:
${chapterDirs.map(dir => {
  const chapterId = dir.split('-')[0];
  const chapterName = dir.split('-').slice(1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
  return `Chapter ${chapterId}: ${chapterName}`;
}).join('\n')}

${'='.repeat(80)}

`;

    return metadata + fullText;

  } catch (error) {
    console.error('Error generating llms.txt content:', error);
    return `# Error generating content\n\nAn error occurred while generating the complete text: ${error}`;
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const fullText = getAllContent();
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="llms.txt"');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(fullText);
  } catch (error) {
    console.error('Error in llms.txt API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
