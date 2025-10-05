import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');

// Helper function to get the main page number for each chapter
export function getMainPageNumber(chapterId: string): string {
  const chapterNumber = parseInt(chapterId, 10);
  if (Number.isNaN(chapterNumber)) return '0';
  if (chapterNumber === 0) return '0';
  return `${chapterNumber}${chapterNumber}`;
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
          const subtitleIndex = lines.findIndex(line => line.trim().startsWith('## '));
          const contentStartIndex = subtitleIndex >= 0 ? subtitleIndex + 1 : 1;
          content = lines.slice(contentStartIndex).join('\n');
          pages = fs.readdirSync(chapterPath)
            .filter(file => file.endsWith('.md') && file !== mainFile)
            .sort((a, b) => parseInt(a) - parseInt(b))
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

export async function getAllPages() {
  const chapters = fs.readdirSync(contentDir)
    .filter(dir => /^\d{2}-/.test(dir))
    .map(dir => dir.split('-')[0])
    .sort((a, b) => parseInt(a) - parseInt(b));

  const allPages: { chapterId: string; pageId: string; title: string }[] = [];

  for (const chapterId of chapters) {
    const chapterDir = fs.readdirSync(contentDir).find(dir => dir.startsWith(`${chapterId}-`));
    if (!chapterDir) continue;

    const chapterPath = path.join(contentDir, chapterDir);
    const files = fs.readdirSync(chapterPath).filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      try {
        const pageId = file.replace('.md', '');
        const filePath = path.join(chapterPath, file);
        const { data } = matter(fs.readFileSync(filePath, 'utf-8'));
        
        allPages.push({
          chapterId,
          pageId,
          title: data.title || pageId
        });
      } catch (error) {
        console.error(`Error reading page ${file} in chapter ${chapterId}:`, error);
      }
    }
  }

  return allPages;
}

export async function getRandomPage() {
  const allPages = await getAllPages();
  if (allPages.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * allPages.length);
  return allPages[randomIndex];
}
