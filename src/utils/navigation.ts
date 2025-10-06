import { getChapters } from './content';
import { formatChapterNumber } from './pageNumbers';

export interface NavigationItem {
  chapterId: string;
  pageId: string | null; // null for chapter landing pages
  title: string;
  subtitle?: string;
  isChapterLanding: boolean;
}

export interface NavigationContext {
  current: NavigationItem;
  previous: NavigationItem | null;
  next: NavigationItem | null;
}

/**
 * Creates a complete navigation index of all pages and chapters
 */
export async function createNavigationIndex(): Promise<NavigationItem[]> {
  const chapters = await getChapters();
  const index: NavigationItem[] = [];

  // Add home page
  index.push({
    chapterId: 'home',
    pageId: null,
    title: 'Field Notes from a Centaur',
    subtitle: 'Learnings from one thousand days using AI.',
    isChapterLanding: false,
  });

  for (const chapter of chapters) {
    // Skip intro/0 from navigation index entirely (we only link to home)
    if (chapter.id === '0') continue;
    // Add chapter landing page
    index.push({
      chapterId: chapter.id,
      pageId: null,
      title: chapter.title,
      subtitle: chapter.subtitle,
      isChapterLanding: true,
    });

    // Add all sub-pages in the chapter
    for (const page of chapter.pages) {
      index.push({
        chapterId: chapter.id,
        pageId: page.id,
        title: page.title,
        isChapterLanding: false,
      });
    }
  }

  return index;
}

/**
 * Gets navigation context for a specific chapter/page
 */
export async function getNavigationContext(
  chapterId: string,
  pageId?: string
): Promise<NavigationContext> {
  const index = await createNavigationIndex();
  
  // Find current item - normalize pageId to null if undefined
  const normalizedPageId = pageId || null;
  const currentIndex = index.findIndex(item => 
    item.chapterId === chapterId && item.pageId === normalizedPageId
  );

  if (currentIndex === -1) {
    throw new Error(`Navigation item not found: ${chapterId}/${pageId || 'landing'}`);
  }

  const current = index[currentIndex];
  const previous = currentIndex > 0 ? index[currentIndex - 1] : null;
  const next = currentIndex < index.length - 1 ? index[currentIndex + 1] : null;

  // No special-case override: from the first sub-page of a chapter, previous
  // should be that chapter's landing page. From the chapter landing, previous
  // is home (as per the index order).

  return { current, previous, next };
}

/**
 * Gets the URL for a navigation item
 */
export function getNavigationUrl(item: NavigationItem): string {
  if (item.chapterId === 'home') {
    return '/';
  }
  if (item.pageId === null) {
    return `/${item.chapterId}`;
  }
  return `/${item.chapterId}/${item.pageId}`;
}

/**
 * Gets the display number for a navigation item
 */
export function getNavigationDisplayNumber(item: NavigationItem): string {
  if (item.chapterId === 'home') {
    return '0';
  }
  if (item.isChapterLanding) {
    return formatChapterNumber(item.chapterId);
  }
  return item.pageId || '';
}
