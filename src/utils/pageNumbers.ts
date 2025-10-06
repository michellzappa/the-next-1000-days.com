export function getMainPageNumber(chapterId: string): string {
  if (chapterId === 'about') return '78';
  
  const chapterNumber = parseInt(chapterId, 10);
  if (Number.isNaN(chapterNumber)) return '0';
  // Intro uses 0; others use the global-linear first page of the chapter:
  // (chapterNumber - 1) * 11 + 1 => 1, 12, 23, 34, ...
  return chapterNumber === 0 ? '0' : String((chapterNumber - 1) * 11 + 1);
}

export function formatDisplayNumber(id: string, chapterId?: string): string {
  const n = parseInt(id, 10);
  
  // For about chapter pages (78, 79, 80), show bullet point instead of number
  if (chapterId === 'about' && (n === 78 || n === 79 || n === 80)) {
    return '•';
  }
  
  return Number.isNaN(n) ? id : String(n);
}

export function formatChapterNumber(chapterId: string): string {
  if (chapterId === 'about') return '';
  
  const n = parseInt(chapterId, 10);
  return Number.isNaN(n) ? chapterId : String(n);
}
