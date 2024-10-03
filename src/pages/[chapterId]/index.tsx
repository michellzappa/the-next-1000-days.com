import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import fs from "fs";
import path from "path";
import Markdown from "../../components/Markdown";
import Footer from "../../components/Footer";

interface SubPage {
  id: string;
  title: string;
}

interface ChapterProps {
  title: string;
  content: string;
  subPages: SubPage[];
}

export default function Chapter({ title, content, subPages }: ChapterProps) {
  const router = useRouter();
  const { chapterId } = router.query;

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col p-8 pb-20 gap-16 sm:p-20 bg-white dark:bg-gray-900 text-black dark:text-white">
      <Head>
        <title>{title} - The Next 1,000 Days</title>
      </Head>
      <Link
        href="/"
        className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
      >
        ← Back to Home
      </Link>
      <Markdown content={content} chapterId={chapterId as string} />

      {subPages.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Pages</h2>
          {subPages.map((page, index) => (
            <div key={page.id} className="mb-6">
              <Link
                href={`/${chapterId}/${page.id}`}
                className="text-xl font-medium hover:underline"
              >
                <span className="inline-block w-12 font-mono text-gray-500">
                  {String(index + 1).padStart(3, "0")}
                </span>
                {page.title}
              </Link>
            </div>
          ))}
        </section>
      )}
      <Footer />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const contentDir = path.join(process.cwd(), "content");
  const chapters = fs
    .readdirSync(contentDir)
    .filter((dir) => /^\d{2}-/.test(dir));

  const paths = chapters.map((dir) => ({
    params: { chapterId: dir.split("-")[0] },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const chapterId = params?.chapterId as string;
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
    .filter((file) => file.endsWith(".txt"))
    .sort((a, b) => a.localeCompare(b));

  const mainFile = chapterFiles[0];
  const content = fs.readFileSync(path.join(chapterPath, mainFile), "utf-8");
  const lines = content.split("\n");
  const title = lines[0].replace("# ", "");

  const subPages = chapterFiles.slice(1).map((file) => {
    const pageContent = fs.readFileSync(path.join(chapterPath, file), "utf-8");
    const pageTitle = pageContent.split("\n")[0].replace("# ", "");
    return { id: file.replace(".txt", ""), title: pageTitle };
  });

  return {
    props: {
      title,
      content: lines.slice(1).join("\n"),
      subPages,
    },
  };
};
