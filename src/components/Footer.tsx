import Link from "next/link"; // Correct import from next/link
import RandomPageButton from "./RandomPageButton";
import { formatDisplayNumber } from "../utils/pageNumbers";

interface FooterProps {
  currentPageNumber?: string;
  chapterId?: string;
  navLeft?: { href: string; number: string; title: string } | null;
  navRight?: { href: string; number: string; title: string } | null;
  showRandom?: boolean;
}

const Footer = ({
  currentPageNumber,
  navLeft,
  navRight,
  showRandom = false,
}: FooterProps) => {
  return (
    <footer className="w-full mt-auto pt-6 pb-8">
      {navLeft || navRight || showRandom ? (
        <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 mx-auto flex justify-between items-center mt-4">
          <div className="flex-1">
            {navLeft ? (
              <Link href={navLeft.href} className="hover:underline">
                <span className="flex flex-col items-start">
                  <span className="text-lg sm:text-xl font-mono font-bold">
                    {formatDisplayNumber(navLeft.number)}
                  </span>
                  <span className="text-sm sm:text-base opacity-80 max-w-[12rem] sm:max-w-[16rem] leading-snug">
                    {navLeft.title}
                  </span>
                </span>
              </Link>
            ) : (
              <span></span>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center">
            {currentPageNumber && (
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">
                {formatDisplayNumber(currentPageNumber)} / 90
              </div>
            )}
            {showRandom ? <RandomPageButton /> : null}
          </div>
          <div className="flex-1 flex justify-end">
            {navRight ? (
              <Link href={navRight.href} className="hover:underline text-right">
                <span className="flex flex-col items-end">
                  <span className="text-base sm:text-lg font-mono font-bold no-underline">
                    {formatDisplayNumber(navRight.number)}
                  </span>
                  <span className="text-sm sm:text-base opacity-80 max-w-[12rem] sm:max-w-[16rem] leading-snug text-right">
                    {navRight.title}
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
          <Link href="/chapter-index" className="text-sm">
            Chapter Index
          </Link>
        </div>
        <div>
          <Link href="https://www.michellzappa.com" className="text-sm">
            Michell Zappa
          </Link>
          <span className="text-sm text-gray-600 dark:text-gray-400"> • </span>
          <Link
            href="https://www.envisioning.io"
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
