import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import fs from "fs";
import path from "path";
import Link from "next/link";
import Markdown from "../../components/Markdown";
import Footer from "../../components/Footer";

interface PageProps {
  title: string;
  content: string;
  chapterTitle: string;
}

export default function Page({ title, content, chapterTitle }: PageProps) {
  const router = useRouter();
  const { chapterId, pageId } = router.query;

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <Head>
          <title>
            {title} - {chapterTitle} - The Next 1,000 Days
          </title>
        </Head>
        <Link
          href={`/${chapterId}`}
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← Back to Chapter
        </Link>
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        <Markdown
          content={content}
          chapterId={chapterId as string}
          pageId={pageId as string}
        />
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

  const paths = chapters.flatMap((chapterDir) => {
    const chapterPath = path.join(contentDir, chapterDir);
    const pages = fs
      .readdirSync(chapterPath)
      .filter((file) => file.endsWith(".txt") && file !== "00.txt");

    return pages.map((page) => ({
      params: {
        chapterId: chapterDir.split("-")[0],
        pageId: page.replace(".txt", ""),
      },
    }));
  });

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const chapterId = params?.chapterId as string;
  const pageId = params?.pageId as string;
  const contentDir = path.join(process.cwd(), "content");
  const chapterDir = fs
    .readdirSync(contentDir)
    .find((dir) => dir.startsWith(`${chapterId}-`));

  if (!chapterDir) {
    return { notFound: true };
  }

  const chapterPath = path.join(contentDir, chapterDir);
  const pageFile = `${pageId}.txt`;
  const pagePath = path.join(chapterPath, pageFile);

  if (!fs.existsSync(pagePath)) {
    return { notFound: true };
  }

  const content = fs.readFileSync(pagePath, "utf-8");
  const lines = content.split("\n");
  const title = lines[0].replace("# ", "");

  // Get chapter title from the first file in the chapter directory
  const chapterFiles = fs.readdirSync(chapterPath).sort();
  const firstChapterFile = chapterFiles[0];
  const chapterContent = fs.readFileSync(
    path.join(chapterPath, firstChapterFile),
    "utf-8"
  );
  const chapterTitle = chapterContent.split("\n")[0].replace("# ", "");

  return {
    props: {
      title,
      content: lines.slice(1).join("\n"),
      chapterTitle,
    },
  };
};
