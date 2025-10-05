import { useRouter } from 'next/router';
import { useEffect, useCallback, useState } from 'react';
import { getNavigationContext, NavigationContext } from '../utils/navigationClient';

interface NavigationProps {
  chapterId: string;
  pageId?: string;
}

export function usePageNavigation({ chapterId, pageId }: NavigationProps) {
  const router = useRouter();
  const [navigationContext, setNavigationContext] = useState<NavigationContext | null>(null);

  // Load navigation context
  useEffect(() => {
    getNavigationContext(chapterId, pageId)
      .then(setNavigationContext)
      .catch(console.error);
  }, [chapterId, pageId]);

  const handleNavigation = useCallback((direction: 'left' | 'right') => {
    if (!navigationContext) return;

    const target = direction === 'left' ? navigationContext.previous : navigationContext.next;
    if (!target) return;

    const url = target.chapterId === 'home' ? '/' : 
                target.pageId ? `/${target.chapterId}/${target.pageId}` : 
                `/${target.chapterId}`;
    
    router.push(url);
  }, [router, navigationContext]);

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
  }, [handleNavigation]);

  return { 
    handleNavigation,
    navigationContext 
  };
}
