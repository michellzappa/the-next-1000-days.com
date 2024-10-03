import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const contentDir = path.join(process.cwd(), 'content');
  const chapters = fs.readdirSync(contentDir)
    .filter(dir => /^\d{2}-/.test(dir))
    .map(dir => {
      const chapterId = dir.split('-')[0];
      const chapterPath = path.join(contentDir, dir);
      const chapterFiles = fs.readdirSync(chapterPath);
      const mainFile = chapterFiles.find(file => file.startsWith(`${chapterId}0.`)) || chapterFiles[0];
      const content = fs.readFileSync(path.join(chapterPath, mainFile), 'utf-8');
      const lines = content.split('\n');
      const title = lines[0].replace('# ', '');
      const description = lines.slice(1).find(line => line.trim() !== '') || '';
      
      const pages = chapterFiles
        .filter(file => file.endsWith('.txt'))
        .map(file => {
          const pageContent = fs.readFileSync(path.join(chapterPath, file), 'utf-8');
          const pageTitle = pageContent.split('\n')[0].replace('# ', '');
          return { id: file.replace('.txt', ''), title: pageTitle };
        });

      return { id: chapterId, title, description, pages };
    });

  res.status(200).json(chapters);
}