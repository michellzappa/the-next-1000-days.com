import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');

export async function getChapters() {
  const chapters = fs.readdirSync(contentDir)
    .filter(dir => /^\d{2}-/.test(dir))
    .map(dir => {
      const chapterId = dir.split('-')[0];
      const chapterPath = path.join(contentDir, dir);
      const mainFile = fs.readdirSync(chapterPath).find(file => file.startsWith(`${chapterId}0.`)) || '';
      
      let title = '';
      let subtitle = '';
      let content = '';
      let pages: { id: string; title: string }[] = [];

      if (mainFile) {
        try {
          const fileContent = fs.readFileSync(path.join(chapterPath, mainFile), 'utf-8');
          const lines = fileContent.split('\n');
          title = lines[0].replace('# ', '');
          subtitle = lines[1]?.replace('## ', '') || '';
          pages = fs.readdirSync(chapterPath)
            .filter(file => file.endsWith('.txt') && file !== mainFile)
            .map(file => {
              const pageContent = fs.readFileSync(path.join(chapterPath, file), 'utf-8');
              const pageTitle = pageContent.split('\n')[0].replace('# ', '');
              return { id: file.replace('.txt', ''), title: pageTitle };
            });
        } catch (error) {
          console.error(`Error reading chapter ${chapterId}:`, error);
        }
      }

      return {
        id: chapterId,
        number: chapterId,
        title,
        subtitle,
        content,
        pages,
      };
    });

  return chapters;
}

export async function getChapter(chapterId: string) {
  const chapterDir = fs.readdirSync(contentDir).find(dir => dir.startsWith(`${chapterId}-`));
  if (!chapterDir) throw new Error(`Chapter ${chapterId} not found`);

  const chapterPath = path.join(contentDir, chapterDir);
  const mainFile = fs.readdirSync(chapterPath).find(file => file.startsWith(`${chapterId}0.`)) || '';
  const { data, content } = matter(fs.readFileSync(path.join(chapterPath, mainFile), 'utf-8'));

  const pages = fs.readdirSync(chapterPath)
    .filter(file => file.endsWith('.txt') && !file.startsWith(`${chapterId}0.`))
    .map(file => {
      const { data } = matter(fs.readFileSync(path.join(chapterPath, file), 'utf-8'));
      return {
        id: file.replace('.txt', ''),
        title: data.title,
      };
    });

  return {
    id: chapterId,
    title: data.title,
    subtitle: data.subtitle,
    content,
    pages,
  };
}

export async function getChapterPages(chapterId: string) {
  const chapterDir = fs.readdirSync(contentDir).find(dir => dir.startsWith(`${chapterId}-`));
  if (!chapterDir) throw new Error(`Chapter ${chapterId} not found`);

  const chapterPath = path.join(contentDir, chapterDir);
  return fs.readdirSync(chapterPath)
    .filter(file => file.endsWith('.txt') && !file.startsWith(`${chapterId}0.`))
    .map(file => ({
      id: file.replace('.txt', ''),
      chapterId,
    }));
}

export async function getPage(chapterId: string, pageId: string) {
  const chapterDir = fs.readdirSync(contentDir).find(dir => dir.startsWith(`${chapterId}-`));
  if (!chapterDir) throw new Error(`Chapter ${chapterId} not found`);

  const chapterPath = path.join(contentDir, chapterDir);
  const filePath = path.join(chapterPath, `${pageId}.txt`);
  
  if (!fs.existsSync(filePath)) throw new Error(`Page ${pageId} not found in chapter ${chapterId}`);

  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));

  return {
    title: data.title,
    content,
  };
}