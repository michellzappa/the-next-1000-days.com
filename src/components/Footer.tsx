import Link from "next/link"; // Correct import from next/link

interface FooterProps {
  currentPageNumber?: string;
  chapterId?: string;
}

const Footer = ({ currentPageNumber, chapterId }: FooterProps) => {
  return (
    <footer className="mt-auto py-4">
      <div className="container mx-auto flex items-left mt-4">
        <Link href="/chapter-index" className="text-sm mr-2">
          Chapter Index
        </Link>
      </div>

      <div className="container mx-auto flex items-left mt-4">
        <Link
          href="https://www.michellzappa.com
        "
          className="text-sm mr-2"
        >
          Michell Zappa
        </Link>
      </div>

      <div className="container mx-auto flex items-left justify-between">
        <div className="flex items-left">
          <a
            href="https://www.envisioning.io"
            className="text-sm mr-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Envisioning
          </a>
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-8">
            {new Date().getFullYear()}
          </span>
        </div>

        {currentPageNumber && (
          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {currentPageNumber} / 089
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
