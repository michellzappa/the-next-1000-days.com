export function getMainPageNumber(chapterId: string): string {
  const chapterNumber = parseInt(chapterId, 10);
  // Move to two-digit page IDs for main chapter pages (e.g., 01 -> 11)
  if (Number.isNaN(chapterNumber)) return '0';
  if (chapterNumber === 0) return '0';
  return `${chapterNumber}${chapterNumber}`;
}

export function formatDisplayNumber(id: string): string {
  const n = parseInt(id, 10);
  return Number.isNaN(n) ? id : String(n);
}
