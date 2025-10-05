import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getNavigationContext,
  NavigationContext,
} from "../utils/navigationClient";

interface GlobalNavigationProps {
  children: React.ReactNode;
}

export default function GlobalNavigation({ children }: GlobalNavigationProps) {
  const router = useRouter();
  const [navigationContext, setNavigationContext] =
    useState<NavigationContext | null>(null);

  useEffect(() => {
    const { chapterId, pageId } = router.query;

    if (!chapterId) {
      // Handle homepage - get navigation context for home
      getNavigationContext("home")
        .then(setNavigationContext)
        .catch(console.error);
      return;
    }

    // Get navigation context for the current chapter/page
    getNavigationContext(chapterId as string, pageId as string)
      .then(setNavigationContext)
      .catch(console.error);
  }, [router.query]);

  const handleNavigation = (direction: "left" | "right") => {
    if (!navigationContext) return;

    const target =
      direction === "left"
        ? navigationContext.previous
        : navigationContext.next;
    if (!target) return;

    const url =
      target.chapterId === "home"
        ? "/"
        : target.pageId
        ? `/${target.chapterId}/${target.pageId}`
        : `/${target.chapterId}`;

    router.push(url);
  };

  const canNavigateLeft = navigationContext?.previous !== null;
  const canNavigateRight = navigationContext?.next !== null;

  return (
    <div className="relative min-h-screen">
      {children}

      {/* Left navigation area */}
      {canNavigateLeft && (
        <div
          className="fixed left-0 top-0 w-[15%] h-full z-50 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-colors duration-200 group"
          onClick={() => handleNavigation("left")}
          title={navigationContext?.previous?.title || "Previous"}
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
          title={navigationContext?.next?.title || "Next"}
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
