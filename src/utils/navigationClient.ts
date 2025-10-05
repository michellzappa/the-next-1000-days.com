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

/**
 * Fetches navigation context from the API
 */
export async function getNavigationContext(
  chapterId: string,
  pageId?: string
): Promise<NavigationContext> {
  const url = new URL('/api/navigation', window.location.origin);
  url.searchParams.set('chapterId', chapterId);
  if (pageId) {
    url.searchParams.set('pageId', pageId);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch navigation context: ${response.statusText}`);
  }

  return response.json();
}
