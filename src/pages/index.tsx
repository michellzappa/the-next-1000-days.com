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
}

interface HomeProps {
  chapters: Chapter[];
}

export default function Home({ chapters }: HomeProps) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <Head>
          <title>The Next 1,000 Days</title>
          <meta
            name="description"
            content="A guide to navigating our transition toward artificial general intelligence"
          />
        </Head>

        <main className="flex-grow">
          <h1 className="text-4xl font-bold mb-8">The Next 1,000 Days</h1>
          <p className="text-xl mb-8">
            A guide for navigating our transition toward artificial general
            intelligence.
          </p>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-3">Chapters</h2>
            {chapters.map((chapter) => (
              <div key={chapter.id} className="mb-2">
                <Link
                  href={`/${chapter.id}/`}
                  className="block hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition duration-150 ease-in-out"
                >
                  <div className="flex items-baseline">
                    <span className="inline-block w-8 font-mono text-gray-500 dark:text-gray-400">
                      {chapter.number.padStart(2, "0")}
                    </span>
                    <span className="text-lg font-medium">{chapter.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 ml-8">
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
