import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface Page {
  id: string;
  number: string;
  title: string;
  subtitle: string;
}

interface ChapterProps {
  title: string;
  content: string;
  pages: Page[];
}

export default function Chapter({ title, content, pages }: ChapterProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <Head>
          <title>{title} - The Next 1,000 Days</title>
        </Head>
        <Navigation />
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        <div className="mb-8" dangerouslySetInnerHTML={{ __html: content }} />

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-3">Pages</h2>
          {pages.map((page) => (
            <div key={page.id} className="mb-2">
              <Link
                href={`/${router.query.id}/${page.id}`}
                className="block hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition duration-150 ease-in-out"
              >
                <div className="flex items-baseline">
                  <span className="inline-block w-8 font-mono text-gray-500 dark:text-gray-400">
                    {page.number.padStart(2, "0")}
                  </span>
                  <span className="text-lg font-medium">{page.title}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 ml-8">
                  {page.subtitle}
                </p>
              </Link>
            </div>
          ))}
        </section>
        <Footer />
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const contentDir = path.join(process.cwd(), "content");
  const chapters = fs
    .readdirSync(contentDir)
    .filter((dir) => /^\d{2}-/.test(dir));

  const paths = chapters.map((dir) => ({
    params: { id: dir.split("-")[0] },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const chapterId = params?.id as string;
  const contentDir = path.join(process.cwd(), "content");
  const chapterDir = fs
    .readdirSync(contentDir)
    .find((dir) => dir.startsWith(`${chapterId}-`));

  if (!chapterDir) {
    return { notFound: true };
  }

  const chapterPath = path.join(contentDir, chapterDir);
  const chapterFiles = fs
    .readdirSync(chapterPath)
    .filter((file) => file.endsWith(".txt"));
  const mainFile =
    chapterFiles.find((file) => file.startsWith(`${chapterId}0.`)) ||
    chapterFiles[0];

  const content = fs.readFileSync(path.join(chapterPath, mainFile), "utf-8");
  const { data, content: mainContent } = matter(content);
  const title = data.title || content.split("\n")[0].replace("# ", "");

  const pages = chapterFiles
    .filter((file) => file !== mainFile)
    .map((file, index) => {
      const filePath = path.join(chapterPath, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);
      return {
        id: file.replace(".txt", ""),
        number: (index + 1).toString(),
        title: data.title || content.split("\n")[0].replace("# ", ""),
        subtitle:
          data.subtitle ||
          content
            .split("\n")
            .slice(1)
            .find((line) => line.trim() !== "") ||
          "",
      };
    });

  return {
    props: {
      title,
      content: mainContent,
      pages,
    },
  };
};
