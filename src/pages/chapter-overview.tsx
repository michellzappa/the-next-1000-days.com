import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { getChapters } from "../utils/content";
import Footer from "../components/Footer";

interface Chapter {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  pages: { id: string; title: string }[];
}

interface ChapterOverviewProps {
  chapters: Chapter[];
}

export default function ChapterOverview({ chapters }: ChapterOverviewProps) {
  const maxPages = Math.max(...chapters.map((chapter) => chapter.pages.length));
  const columnWidth = `${100 / chapters.length}%`;

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <Head>
          <title>Chapter Overview - The Next 1,000 Days</title>
        </Head>

        <h1 className="text-4xl font-bold mb-8">Chapter Overview</h1>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr>
                {chapters.map((chapter) => (
                  <th
                    key={chapter.id}
                    className="border p-2 text-center align-top"
                    style={{ width: columnWidth }}
                  >
                    <div className="mt-2">
                      <Link href={`/${chapter.id}`} className="hover:underline">
                        {chapter.number}
                      </Link>
                      <div className="text-xs mt-1 font-normal">
                        {chapter.title}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(maxPages)].map((_, index) => (
                <tr key={index}>
                  {chapters.map((chapter) => {
                    const page = chapter.pages[index];
                    return (
                      <td
                        key={`${chapter.id}-${index}`}
                        className="border p-2 text-center align-top"
                        style={{ width: columnWidth }}
                      >
                        {page && (
                          <div className="mt-2">
                            <Link
                              href={`/${chapter.id}/${page.id}`}
                              className="hover:underline"
                            >
                              {page.id}
                            </Link>
                            <div className="text-xs mt-1 font-normal">
                              {page.title}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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
