import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import fs from "fs";
import path from "path";
import Link from "next/link";
import Markdown from "../../components/Markdown";
import Footer from "../../components/Footer";
import { getChapters } from "../../utils/content";

interface PageProps {
  title: string;
  subtitle: string | null; // Add this line
  content: string;
  chapterTitle: string;
  nextPage: { id: string; title: string } | null;
  nextChapter: { id: string; title: string } | null;
}

export default function Page({
  title,
  subtitle, // Add this line
  content,
  chapterTitle,
  nextPage,
  nextChapter,
  lastUpdated,
}: PageProps & { lastUpdated: string }) {
  const router = useRouter();
  const { chapterId, pageId } = router.query;

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground">
      <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <Head>
          <title>
            {title} - {chapterTitle} - The Next 1,000 Days
          </title>
        </Head>
        <Link
          href="/"
          className="text-blue-200 dark:text-blue-800 hover:underline mb-2 inline-block"
        >
          ← Back to Home
        </Link>
        <br />
        <Link
          href={`/${chapterId}`}
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← Back to Chapter: {chapterTitle}
        </Link>
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        {subtitle && (
          <h2 className="text-2xl font-semibold mb-6">{subtitle}</h2>
        )}
        <Markdown
          content={content}
          chapterId={chapterId as string}
          pageId={pageId as string}
        />
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Last updated: {lastUpdated}
        </div>
        {nextPage ? (
          <div className="mt-8">
            <Link
              href={`/${chapterId}/${nextPage.id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Next Page: {nextPage.title} ({nextPage.id}) →
            </Link>
          </div>
        ) : nextChapter ? (
          <div className="mt-8">
            <Link
              href={`/${nextChapter.id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Next Chapter: {nextChapter.title} →
            </Link>
          </div>
        ) : null}
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
  const subtitle =
    lines[1] && lines[1].startsWith("## ") ? lines[1].replace("## ", "") : null;

  // Get chapter title from the first file in the chapter directory
  const chapterFiles = fs
    .readdirSync(chapterPath)
    .filter((file) => file.endsWith(".txt"))
    .sort();
  const firstChapterFile = chapterFiles[0];
  const chapterContent = fs.readFileSync(
    path.join(chapterPath, firstChapterFile),
    "utf-8"
  );
  const chapterTitle = chapterContent.split("\n")[0].replace("# ", "");

  // Determine next page or next chapter
  const currentPageIndex = chapterFiles.indexOf(pageFile);
  let nextPage = null;
  let nextChapter = null;

  if (currentPageIndex < chapterFiles.length - 1) {
    const nextPageFile = chapterFiles[currentPageIndex + 1];
    const nextPageContent = fs.readFileSync(
      path.join(chapterPath, nextPageFile),
      "utf-8"
    );
    const nextPageTitle = nextPageContent.split("\n")[0].replace("# ", "");
    nextPage = {
      id: nextPageFile.replace(".txt", ""),
      title: nextPageTitle,
    };
  } else {
    const chapters = await getChapters();
    const currentChapterIndex = chapters.findIndex(
      (chapter) => chapter.id === chapterId
    );
    if (currentChapterIndex < chapters.length - 1) {
      nextChapter = chapters[currentChapterIndex + 1];
    }
  }

  const stats = fs.statSync(pagePath);
  const lastUpdated = new Date(stats.mtime).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    props: {
      title,
      subtitle, // Add this line
      content: lines.slice(subtitle ? 2 : 1).join("\n"), // Modify this line
      chapterTitle,
      nextPage,
      nextChapter,
      lastUpdated,
    },
  };
};
