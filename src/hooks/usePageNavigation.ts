import { useRouter } from 'next/router';
import { useEffect, useCallback } from 'react';

interface NavigationProps {
  chapterId: string;
  pageId?: string;
  navigation: {
    previousPage?: { id: string; title: string } | null;
    nextPage?: { id: string; title: string } | null;
    previousChapter?: { id: string; title: string; lastPage?: string | null } | null;
    nextChapter?: { id: string; title: string } | null;
  };
  subPages?: { id: string; title: string }[];
}

export function usePageNavigation({ chapterId, pageId, navigation, subPages }: NavigationProps) {
  const router = useRouter();

  const handleNavigation = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left') {
      if (pageId) {
        if (navigation.previousPage) {
          router.push(`/${chapterId}/${navigation.previousPage.id}`);
        } else if (navigation.previousChapter) {
          if (navigation.previousChapter.lastPage) {
            router.push(`/${navigation.previousChapter.id}/${navigation.previousChapter.lastPage}`);
          } else {
            router.push(`/${navigation.previousChapter.id}`);
          }
        }
      } else if (navigation.previousChapter) {
        if (navigation.previousChapter.lastPage) {
          router.push(`/${navigation.previousChapter.id}/${navigation.previousChapter.lastPage}`);
        } else {
          router.push(`/${navigation.previousChapter.id}`);
        }
      }
    } else if (direction === 'right') {
      if (pageId) {
        if (navigation.nextPage) {
          router.push(`/${chapterId}/${navigation.nextPage.id}`);
        } else if (navigation.nextChapter) {
          router.push(`/${navigation.nextChapter.id}`);
        }
      } else {
        if (subPages && subPages.length > 0) {
          router.push(`/${chapterId}/${subPages[0].id}`);
        } else if (navigation.nextChapter) {
          router.push(`/${navigation.nextChapter.id}`);
        }
      }
    }
  }, [router, chapterId, pageId, navigation, subPages]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handleNavigation('left');
      } else if (event.key === "ArrowRight") {
        handleNavigation('right');
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, chapterId, pageId, navigation, subPages, handleNavigation]);

  return { handleNavigation };
}
