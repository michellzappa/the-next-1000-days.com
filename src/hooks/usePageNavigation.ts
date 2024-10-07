import { useRouter } from 'next/router';
import { useSwipeable } from 'react-swipeable';
import { useEffect } from 'react';

interface NavigationProps {
  chapterId: string;
  pageId?: string;
  navigation: {
    previousPage?: { id: string; title: string } | null;
    nextPage?: { id: string; title: string } | null;
    previousChapter?: { id: string; title: string } | null;
    nextChapter?: { id: string; title: string } | null;
  };
}

export function usePageNavigation({ chapterId, pageId, navigation }: NavigationProps) {
  const router = useRouter();

  const handleNavigation = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      if (pageId) {
        if (pageId.endsWith("1") && pageId !== "01") {
          router.push(`/${chapterId}`);
        } else if (navigation.previousPage) {
          router.push(`/${chapterId}/${navigation.previousPage.id}`);
        } else if (navigation.previousChapter) {
          router.push(`/${navigation.previousChapter.id}`);
        }
      } else if (navigation.previousChapter) {
        router.push(`/${navigation.previousChapter.id}`);
      }
    } else if (direction === 'right') {
      if (pageId) {
        if (navigation.nextPage) {
          router.push(`/${chapterId}/${navigation.nextPage.id}`);
        } else if (navigation.nextChapter) {
          router.push(`/${navigation.nextChapter.id}`);
        }
      } else if (navigation.nextChapter) {
        router.push(`/${navigation.nextChapter.id}`);
      } else if (navigation.nextPage) {
        router.push(`/${chapterId}/${navigation.nextPage.id}`);
      }
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNavigation('right'),
    onSwipedRight: () => handleNavigation('left'),
    delta: 10,
    trackMouse: true
  });

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
  }, [router, chapterId, pageId, navigation]);

  return swipeHandlers;
}