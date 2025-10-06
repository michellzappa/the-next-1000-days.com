import Link from "next/link";
import RandomPageButton from "./RandomPageButton";
import {
  getNavigationContext,
  getNavigationUrl,
  getNavigationDisplayNumber,
  NavigationContext,
} from "../utils/navigationClient";
import { useEffect, useState } from "react";

interface FooterProps {
  currentPageNumber?: string;
  chapterId?: string;
  pageId?: string;
  navLeft?: { href: string; number: string; title: string } | null;
  navRight?: { href: string; number: string; title: string } | null;
  showRandom?: boolean;
}

const Footer = ({
  currentPageNumber,
  chapterId,
  pageId,
  navLeft,
  navRight,
  showRandom = false,
}: FooterProps) => {
  const [navigationContext, setNavigationContext] =
    useState<NavigationContext | null>(null);

  // Load navigation context only if server didn't provide navLeft/navRight
  useEffect(() => {
    if (!navLeft && !navRight && chapterId) {
      getNavigationContext(chapterId, pageId)
        .then(setNavigationContext)
        .catch(console.error);
    }
  }, [chapterId, pageId, navLeft, navRight]);

  // Use centralized navigation if available, otherwise fall back to props
  const effectiveNavLeft =
    navigationContext?.previous && !navLeft
      ? {
          href: getNavigationUrl(navigationContext.previous),
          number: getNavigationDisplayNumber(navigationContext.previous),
          title: navigationContext.previous.title,
        }
      : navLeft || null;

  const effectiveNavRight =
    navigationContext?.next && !navRight
      ? {
          href: getNavigationUrl(navigationContext.next),
          number: getNavigationDisplayNumber(navigationContext.next),
          title: navigationContext.next.title,
        }
      : navRight || null;

  // Prefix chapter landing links with "Chapter "
  const leftNumber = effectiveNavLeft
    ? /^\/\d+$/.test(effectiveNavLeft.href)
      ? `Chapter ${effectiveNavLeft.number}`
      : effectiveNavLeft.number
    : null;
  const rightNumber = effectiveNavRight
    ? /^\/\d+$/.test(effectiveNavRight.href)
      ? `Chapter ${effectiveNavRight.number}`
      : effectiveNavRight.number
    : null;

  return (
    <footer className="w-full mt-auto pt-6 pb-8">
      {effectiveNavLeft || effectiveNavRight || showRandom ? (
        <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 mx-auto flex justify-between items-start mt-4">
          <div className="flex-1">
            {effectiveNavLeft ? (
              <Link href={effectiveNavLeft.href} className="hover:underline">
                <span className="flex flex-col items-start">
                  <span className="text-base text-gray-500 dark:text-gray-400 font-mono font-bold">
                    {leftNumber}
                  </span>
                  <span className="text-xs sm:text-sm opacity-80 max-w-[12rem] sm:max-w-[16rem] leading-snug">
                    {effectiveNavLeft.title}
                  </span>
                </span>
              </Link>
            ) : (
              <span></span>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center">
            {currentPageNumber && (
              <div className="text-base text-black dark:text-white font-mono font-bold mb-2">
                {currentPageNumber}
              </div>
            )}
            {showRandom ? <RandomPageButton /> : null}
          </div>
          <div className="flex-1 flex justify-end">
            {effectiveNavRight ? (
              <Link
                href={effectiveNavRight.href}
                className="hover:underline text-right"
              >
                <span className="flex flex-col items-end">
                  <span className="text-base text-gray-500 dark:text-gray-400 font-mono font-bold no-underline">
                    {rightNumber}
                  </span>
                  <span className="text-xs sm:text-sm opacity-80 max-w-[12rem] sm:max-w-[16rem] leading-snug text-right">
                    {effectiveNavRight.title}
                  </span>
                </span>
              </Link>
            ) : (
              <span></span>
            )}
          </div>
        </div>
      ) : null}

      {/* Separator between nav and footer */}
      <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 mx-auto mt-6 border-t border-gray-200 dark:border-gray-800"></div>

      {/* Centered footer */}
      <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 mx-auto mt-4 flex flex-col items-center text-center gap-2">
        <div>
          <Link href="/" className="text-sm">
            Home
          </Link>
          <span className="text-sm text-gray-600 dark:text-gray-400"> • </span>
          <Link href="/chapter-index" className="text-sm">
            Index
          </Link>
          <span className="text-sm text-gray-600 dark:text-gray-400"> • </span>
          <Link href="/8" className="text-sm">
            About
          </Link>
        </div>
        <div>
          <Link href="https://www.michellzappa.com" className="text-sm">
            Michell Zappa
          </Link>
          <span className="text-sm text-gray-600 dark:text-gray-400"> • </span>
          <Link
            href="https://www.envisioning.com"
            className="text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Envisioning
          </Link>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
