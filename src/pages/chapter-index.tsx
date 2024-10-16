import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { getChapters } from "../utils/content";
import Footer from "../components/Footer";

interface Chapter {
  id: string;
  number: string;
  title: string;
  subtitle: string; // Remains unchanged as per current requirements
  pages: { id: string; title: string }[];
}

interface ChapterOverviewProps {
  chapters: Chapter[];
}

export default function ChapterOverview({ chapters }: ChapterOverviewProps) {
  // Determine the maximum number of pages across all chapters
  const maxPages = Math.max(...chapters.map((chapter) => chapter.pages.length));

  // Utility function to add a "0" to chapter numbers, e.g., "02" -> "020"
  const formatChapterNumber = (number: string): string => {
    return number.padEnd(3, "0");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <Head>
          <title>Chapter Overview - The Next 1.000 Days</title>
        </Head>

        <h1 className="text-4xl font-bold mb-8">Chapter Overview</h1>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full table-fixed">
              <thead>
                <tr>
                  {/* Header cell for "Chapter" with shaded background */}
                  <th className="p-1 text-center align-top bg-gray-200 dark:bg-gray-700 w-20">
                    <div className="font-bold">Chapter</div>
                  </th>
                  {/* Generate header cells for each page number */}
                  {[...Array(maxPages)].map((_, index) => (
                    <th key={index} className="p-1 text-center align-top w-20">
                      <div className="font-bold">{index + 1}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chapters.map((chapter) => (
                  <tr key={chapter.id}>
                    {/* Chapter cell with shaded background */}
                    <td className="p-1 text-center border align-top bg-gray-100 dark:bg-gray-800 w-20">
                      <Link
                        href={`/${chapter.id}`}
                        className="block rounded-lg p-2 transition duration-150 ease-in-out hover:outline hover:outline-2 hover:outline-gray-300 dark:hover:outline-gray-600"
                      >
                        <div className="font-bold">
                          {/* Formatted Chapter Number */}
                          <span className="font-mono">
                            {formatChapterNumber(chapter.number)}
                          </span>
                        </div>
                        {/* Chapter Title on a New Line */}
                        <div className="text-sm mt-1 font-normal">
                          {chapter.title}
                        </div>
                        {/* Subtitle removed */}
                      </Link>
                    </td>
                    {/* Page cells */}
                    {[...Array(maxPages)].map((_, index) => {
                      const page = chapter.pages[index];
                      return (
                        <td
                          key={`${chapter.id}-page-${index}`}
                          className="p-1 text-center border align-top w-20"
                        >
                          {page ? (
                            <Link
                              href={`/${chapter.id}/${page.id}`}
                              className="block rounded-lg p-2 transition duration-150 ease-in-out hover:outline hover:outline-2 hover:outline-gray-300 dark:hover:outline-gray-600"
                            >
                              <div className="font-bold font-mono">
                                {page.id}
                              </div>
                              <div className="text-xs mt-1 font-normal">
                                {page.title}
                              </div>
                            </Link>
                          ) : (
                            <div></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const chapters = await getChapters();
  return {
    props: {
      chapters,
    },
  };
};
