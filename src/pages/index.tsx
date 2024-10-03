import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { getChapters } from "../utils/content";
import Footer from "../components/Footer";

interface Chapter {
  id: string;
  title: string;
  subtitle: string;
}

interface HomeProps {
  chapters: Chapter[];
}

export default function Home({ chapters }: HomeProps) {
  return (
    <div className="min-h-screen flex flex-col p-8 pb-20 gap-16 sm:p-20 bg-white dark:bg-gray-900 text-black dark:text-white">
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
          A human-readable guide for navigating our transition toward artificial
          general intelligence.
        </p>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Chapters</h2>
          {chapters.map((chapter) => (
            <div key={chapter.id} className="mb-6">
              <Link
                href={`/${chapter.id}/`}
                className="text-xl font-medium hover:underline"
              >
                {chapter.title}
              </Link>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {chapter.subtitle}
              </p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
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
