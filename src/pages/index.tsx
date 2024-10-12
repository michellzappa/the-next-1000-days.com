import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { getChapters } from "../utils/content";
import Footer from "../components/Footer";
import Markdown from "../components/Markdown";
import { usePageNavigation } from "../hooks/usePageNavigation"; // Add this import

interface Chapter {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  content?: string;
  pages?: { id: string; title: string }[];
}

interface HomeProps {
  chapters: Chapter[];
}

export default function Home({ chapters }: HomeProps) {
  const introChapter = chapters.find((chapter) => chapter.id === "00");
  const mainChapters = chapters.filter((chapter) => chapter.id !== "00");

  // Correct the navigation setup
  const navigation = {
    nextPage: introChapter?.pages?.[0]
      ? { id: "001", title: introChapter.pages[0].title }
      : null,
    nextChapter: !introChapter?.pages?.length ? mainChapters[0] : null,
  };

  const swipeHandlers = usePageNavigation({
    chapterId: "00",
    navigation,
  });

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground">
      <div
        {...swipeHandlers} // Add this line to enable swipe gestures
        className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12"
      >
        <Head>
          <title>The Next 1.000 Days</title>
          <meta
            name="description"
            content="A guide to navigating our transition toward artificial general intelligence"
          />
        </Head>

        <main className="flex-grow">
          <h1 className="text-4xl font-bold mb-8">The Next 1.000 Days</h1>
          <h2 className="text-2xl mb-8 italic">
            Your guide for navigating the transition toward AGI.
          </h2>

          {introChapter && (
            <section className="mt-8 mb-12">
              <Markdown
                content={introChapter.content || ""}
                chapterId="00"
                pageId="000"
              />
              <h3 className="text-2xl font-semibold mt-8 mb-3">
                Introduction Pages
              </h3>
              {introChapter.pages &&
                introChapter.pages.map((page) => (
                  <div key={page.id} className="mb-2">
                    <Link
                      href={`/00/${page.id}`}
                      className="block hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition duration-150 ease-in-out"
                    >
                      <div className="flex items-baseline">
                        <span className="inline-block w-8 font-mono text-sm font-bold text-gray-500 dark:text-gray-400">
                          {page.id.padStart(3, "0")}
                        </span>
                        <span className="text-lg font-medium">
                          {page.title}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-3">Chapters</h2>
            {mainChapters.map((chapter) => (
              <div key={chapter.id} className="mb-2">
                <Link
                  href={`/${chapter.id}/`}
                  className="block rounded-lg p-2 transition duration-150 ease-in-out hover:outline hover:outline-2 hover:outline-gray-300 dark:hover:outline-gray-600"
                >
                  <div className="flex items-baseline">
                    <span className="inline-block w-12 text-base font-mono text-gray-500 dark:text-gray-400">
                      {(parseInt(chapter.number) * 10)
                        .toString()
                        .padStart(3, "0")}
                    </span>
                    <span className="text-lg font-bold">{chapter.title}</span>
                  </div>
                  <p className="text-base text-gray-600 dark:text-gray-400 mt-0.5 ml-12">
                    {chapter.subtitle}
                  </p>
                </Link>
              </div>
            ))}
          </section>
        </main>
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
