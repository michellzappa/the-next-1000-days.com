import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GlobalNavigationProps {
  children: React.ReactNode;
}

interface NavigationData {
  previousPage?: { id: string; title: string } | null;
  nextPage?: { id: string; title: string } | null;
  previousChapter?: {
    id: string;
    title: string;
    lastPage?: string | null;
  } | null;
  nextChapter?: { id: string; title: string } | null;
}

export default function GlobalNavigation({ children }: GlobalNavigationProps) {
  const router = useRouter();
  const [navigation, setNavigation] = useState<NavigationData>({});
  const [chapters, setChapters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChapters = async () => {
      try {
        const response = await fetch("/api/chapters");
        const chaptersData = await response.json();
        setChapters(chaptersData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load chapters:", error);
        setIsLoading(false);
      }
    };

    loadChapters();
  }, []);

  useEffect(() => {
    if (isLoading || !chapters.length) return;

    const { chapterId, pageId } = router.query;

    if (!chapterId) {
      setNavigation({});
      return;
    }

    const currentChapterIndex = chapters.findIndex(
      (chapter) => chapter.id === chapterId
    );

    if (currentChapterIndex === -1) {
      setNavigation({});
      return;
    }

    const currentChapter = chapters[currentChapterIndex];

    if (pageId) {
      // We're on a specific page
      const currentPageIndex = currentChapter.pages.findIndex(
        (page: any) => page.id === pageId
      );

      const previousPage =
        currentPageIndex > 0
          ? currentChapter.pages[currentPageIndex - 1]
          : null;

      const nextPage =
        currentPageIndex < currentChapter.pages.length - 1
          ? currentChapter.pages[currentPageIndex + 1]
          : null;

      const previousChapter =
        currentPageIndex === 0 && currentChapterIndex > 0
          ? chapters[currentChapterIndex - 1]
          : null;

      const nextChapter =
        currentPageIndex === currentChapter.pages.length - 1 &&
        currentChapterIndex < chapters.length - 1
          ? chapters[currentChapterIndex + 1]
          : null;

      setNavigation({
        previousPage: previousPage
          ? { id: previousPage.id, title: previousPage.title }
          : null,
        nextPage: nextPage ? { id: nextPage.id, title: nextPage.title } : null,
        previousChapter: previousChapter
          ? {
              id: previousChapter.id,
              title: previousChapter.title,
              lastPage:
                previousChapter.pages.length > 0
                  ? previousChapter.pages[previousChapter.pages.length - 1].id
                  : null,
            }
          : null,
        nextChapter: nextChapter
          ? { id: nextChapter.id, title: nextChapter.title }
          : null,
      });
    } else {
      // We're on a chapter index page
      const previousChapter =
        currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;

      const nextChapter =
        currentChapterIndex < chapters.length - 1
          ? chapters[currentChapterIndex + 1]
          : null;

      const firstPage =
        currentChapter.pages.length > 0 ? currentChapter.pages[0] : null;

      setNavigation({
        previousChapter: previousChapter
          ? {
              id: previousChapter.id,
              title: previousChapter.title,
              lastPage:
                previousChapter.pages.length > 0
                  ? previousChapter.pages[previousChapter.pages.length - 1].id
                  : null,
            }
          : null,
        nextChapter: nextChapter
          ? { id: nextChapter.id, title: nextChapter.title }
          : null,
        nextPage: firstPage
          ? { id: firstPage.id, title: firstPage.title }
          : null,
      });
    }
  }, [router.query, chapters, isLoading]);

  const handleNavigation = (direction: "left" | "right") => {
    const { chapterId, pageId } = router.query;

    if (direction === "left") {
      if (pageId) {
        if (navigation.previousPage) {
          router.push(`/${chapterId}/${navigation.previousPage.id}`);
        } else if (navigation.previousChapter) {
          if (navigation.previousChapter.lastPage) {
            router.push(
              `/${navigation.previousChapter.id}/${navigation.previousChapter.lastPage}`
            );
          } else {
            router.push(`/${navigation.previousChapter.id}`);
          }
        }
      } else if (navigation.previousChapter) {
        if (navigation.previousChapter.lastPage) {
          router.push(
            `/${navigation.previousChapter.id}/${navigation.previousChapter.lastPage}`
          );
        } else {
          router.push(`/${navigation.previousChapter.id}`);
        }
      }
    } else if (direction === "right") {
      if (pageId) {
        if (navigation.nextPage) {
          router.push(`/${chapterId}/${navigation.nextPage.id}`);
        } else if (navigation.nextChapter) {
          router.push(`/${navigation.nextChapter.id}`);
        }
      } else {
        if (navigation.nextPage) {
          router.push(`/${chapterId}/${navigation.nextPage.id}`);
        } else if (navigation.nextChapter) {
          router.push(`/${navigation.nextChapter.id}`);
        }
      }
    }
  };

  const canNavigateLeft = navigation.previousPage || navigation.previousChapter;
  const canNavigateRight = navigation.nextPage || navigation.nextChapter;

  return (
    <div className="relative min-h-screen">
      {children}

      {/* Left navigation area */}
      {canNavigateLeft && (
        <div
          className="fixed left-0 top-0 w-[15%] h-full z-50 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-colors duration-200 group"
          onClick={() => handleNavigation("left")}
          title={
            navigation.previousPage?.title ||
            navigation.previousChapter?.title ||
            "Previous"
          }
        >
          {/* Optional: Add a subtle visual indicator */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ChevronLeft className="w-8 h-8 text-gray-600 dark:text-gray-300" />
          </div>
        </div>
      )}

      {/* Right navigation area */}
      {canNavigateRight && (
        <div
          className="fixed right-0 top-0 w-[15%] h-full z-50 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-colors duration-200 group"
          onClick={() => handleNavigation("right")}
          title={
            navigation.nextPage?.title ||
            navigation.nextChapter?.title ||
            "Next"
          }
        >
          {/* Optional: Add a subtle visual indicator */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ChevronRight className="w-8 h-8 text-gray-600 dark:text-gray-300" />
          </div>
        </div>
      )}
    </div>
  );
}
