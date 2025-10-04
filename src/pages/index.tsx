import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { getChapters } from "../utils/content";
import Footer from "../components/Footer";
import Markdown from "../components/Markdown";
import { usePageNavigation } from "../hooks/usePageNavigation";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

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

  const CustomComponent = dynamic(() => import("../components/chapter/000"));

  // Days counter for AI milestones
  const [chatGPTDays, setChatGPTDays] = useState(0);
  const [gpt4Days, setGpt4Days] = useState(0);

  useEffect(() => {
    const calculateDays = (launchDate: string) => {
      const launch = new Date(launchDate);
      const today = new Date();
      const difference = today.getTime() - launch.getTime();
      return Math.floor(difference / (1000 * 60 * 60 * 24));
    };

    setChatGPTDays(calculateDays("2022-11-30"));
    setGpt4Days(calculateDays("2023-03-14"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground">
      <div
        {...swipeHandlers}
        className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-6"
      >
        <Head>
          <title>The Next 1.000 Days</title>
          <meta
            name="description"
            content="Your guide to navigating the transition to AGI."
          />
        </Head>

        <main className="flex-grow">
          <h1 className="text-4xl font-bold mb-8">
            Field Notes from a Centaur
          </h1>
          <h2 className="text-2xl mb-8 italic">
            Learnings from one thousand days using AI.
          </h2>

          <div className="w-full flex justify-center mb-12">
            <div className="w-full max-w-[70rem]">
              <CustomComponent />
            </div>
          </div>

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
                      {chapter.id === "01"
                        ? "011"
                        : chapter.id === "02"
                        ? "022"
                        : chapter.id === "03"
                        ? "033"
                        : chapter.id === "04"
                        ? "044"
                        : chapter.id === "05"
                        ? "055"
                        : chapter.id === "06"
                        ? "066"
                        : chapter.id === "07"
                        ? "077"
                        : chapter.id === "08"
                        ? "088"
                        : "000"}
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

          <section className="mt-12 mb-8 p-6">
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-2xl font-bold">{chatGPTDays}</div>
                <div className="text-sm">days since ChatGPT launch</div>
                <div className="text-xs">Nov 30, 2022</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{gpt4Days}</div>
                <div className="text-sm">days since GPT-4 launch</div>
                <div className="text-xs">Mar 14, 2023</div>
              </div>
            </div>
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
