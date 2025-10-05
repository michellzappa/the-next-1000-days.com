export function getMainPageNumber(chapterId: string): string {
  const chapterNumber = parseInt(chapterId, 10);
  return chapterNumber === 0
    ? '000'
    : chapterNumber === 1
    ? '011'
    : chapterNumber === 2
    ? '022'
    : chapterNumber === 3
    ? '033'
    : chapterNumber === 4
    ? '044'
    : chapterNumber === 5
    ? '055'
    : chapterNumber === 6
    ? '066'
    : chapterNumber === 7
    ? '077'
    : chapterNumber === 8
    ? '088'
    : '000';
}


