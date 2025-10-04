import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');

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

export async function getChapters() {
  const chapters = fs.readdirSync(contentDir)
    .filter(dir => /^\d{2}-/.test(dir))
    .map(dir => {
      const chapterId = dir.split('-')[0];
      const chapterPath = path.join(contentDir, dir);
      const mainPageNumber = getMainPageNumber(chapterId);
      const mainFile = fs.readdirSync(chapterPath).find(file => file.startsWith(`${mainPageNumber}.`)) || '';
      
      let title = '';
      let subtitle = '';
      let content = '';
      let pages: { id: string; title: string }[] = [];

      if (mainFile) {
        try {
          const fileContent = fs.readFileSync(path.join(chapterPath, mainFile), 'utf-8');
          const lines = fileContent.split('\n');
          title = lines[0].replace('# ', '');
          
          // Find the first ## subtitle line, skipping any blank lines
          const subtitleLine = lines.find(line => line.trim().startsWith('## '));
          subtitle = subtitleLine ? subtitleLine.replace('## ', '').trim() : '';
          
          // Get content starting after the title and subtitle lines
          const titleIndex = 0;
          const subtitleIndex = lines.findIndex(line => line.trim().startsWith('## '));
          const contentStartIndex = subtitleIndex >= 0 ? subtitleIndex + 1 : 1;
          content = lines.slice(contentStartIndex).join('\n');
          pages = fs.readdirSync(chapterPath)
            .filter(file => file.endsWith('.md') && file !== mainFile)
            .map(file => {
              const pageContent = fs.readFileSync(path.join(chapterPath, file), 'utf-8');
              const pageTitle = pageContent.split('\n')[0].replace('# ', '');
              return { id: file.replace('.md', ''), title: pageTitle };
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
  const mainPageNumber = getMainPageNumber(chapterId);
  const mainFile = fs.readdirSync(chapterPath).find(file => file.startsWith(`${mainPageNumber}.`)) || '';
  const { data, content } = matter(fs.readFileSync(path.join(chapterPath, mainFile), 'utf-8'));

  const pages = fs.readdirSync(chapterPath)
    .filter(file => file.endsWith('.md') && !file.startsWith(`${mainPageNumber}.`))
    .map(file => {
      const { data } = matter(fs.readFileSync(path.join(chapterPath, file), 'utf-8'));
      return {
        id: file.replace('.md', ''),
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
  const mainPageNumber = getMainPageNumber(chapterId);
  return fs.readdirSync(chapterPath)
    .filter(file => file.endsWith('.md') && !file.startsWith(`${mainPageNumber}.`))
    .map(file => ({
      id: file.replace('.md', ''),
      chapterId,
    }));
}

export async function getPage(chapterId: string, pageId: string) {
  const chapterDir = fs.readdirSync(contentDir).find(dir => dir.startsWith(`${chapterId}-`));
  if (!chapterDir) throw new Error(`Chapter ${chapterId} not found`);

  const chapterPath = path.join(contentDir, chapterDir);
  const filePath = path.join(chapterPath, `${pageId}.md`);
  
  if (!fs.existsSync(filePath)) throw new Error(`Page ${pageId} not found in chapter ${chapterId}`);

  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));

  return {
    title: data.title,
    content,
  };
}