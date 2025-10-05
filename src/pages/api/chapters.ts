import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Helper function to get the main page number for each chapter
function getMainPageNumber(chapterId: string): string {
  const chapterNumber = parseInt(chapterId);
  return chapterNumber === 0 ? '000' : 
    chapterNumber === 1 ? '011' :
    chapterNumber === 2 ? '022' :
    chapterNumber === 3 ? '033' :
    chapterNumber === 4 ? '044' :
    chapterNumber === 5 ? '055' :
    chapterNumber === 6 ? '066' :
    chapterNumber === 7 ? '077' :
    chapterNumber === 8 ? '088' : '000';
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const contentDir = path.join(process.cwd(), 'content');
  const chapters = fs.readdirSync(contentDir)
    .filter(dir => /^\d{2}-/.test(dir))
    .map(dir => {
      const chapterId = dir.split('-')[0];
      const chapterPath = path.join(contentDir, dir);
      const chapterFiles = fs.readdirSync(chapterPath);
      const mainPageNumber = getMainPageNumber(chapterId);
      const mainFile = chapterFiles.find(file => file.startsWith(`${mainPageNumber}.`)) || chapterFiles[0];
      const content = fs.readFileSync(path.join(chapterPath, mainFile), 'utf-8');
      const lines = content.split('\n');
      const title = lines[0].replace('# ', '');
      
      // Find the first non-empty line after the title (could be subtitle or content)
      const firstNonEmptyLine = lines.slice(1).find(line => line.trim() !== '');
      const description = firstNonEmptyLine || '';
      
      const pages = chapterFiles
        .filter(file => file.endsWith('.md') && !file.startsWith(`${mainPageNumber}.`))
        .map(file => {
          const pageContent = fs.readFileSync(path.join(chapterPath, file), 'utf-8');
          const pageTitle = pageContent.split('\n')[0].replace('# ', '');
          return { id: file.replace('.md', ''), title: pageTitle };
        });

      return { id: chapterId, title, description, pages };
    });

  res.status(200).json(chapters);
}