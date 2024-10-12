import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import fs from "fs";
import path from "path";
import Link from "next/link";
import Markdown from "../../components/Markdown";
import Footer from "../../components/Footer";
import { getChapters } from "../../utils/content";
import { useEffect } from "react";
import { existsSync } from "fs";
import { join } from "path";
import dynamic from "next/dynamic";
import { usePageNavigation } from "../../hooks/usePageNavigation";

interface PageProps {
  title: string;
  subtitle: string | null; // Add this line
  content: string;
  chapterTitle: string;
  nextPage: { id: string; title: string } | null;
  nextChapter: { id: string; title: string } | null;
}

interface PageNavigation {
  previousPage: { id: string; title: string } | null;
  nextPage: { id: string; title: string } | null;
  previousChapter: {
    id: string;
    title: string;
    pages: { id: string; title: string }[];
  } | null;
  nextChapter: {
    id: string;
    title: string;
    pages: { id: string; title: string }[];
  } | null;
}

export default function Page({
  title,
  subtitle, // Add this line
  content,
  chapterTitle,
  navigation,
  lastUpdated,
  hasCustomComponent, // Add this line
}: PageProps & {
  lastUpdated: string;
  navigation: PageNavigation;
  hasCustomComponent: boolean;
}) {
  const router = useRouter();
  const { chapterId, pageId } = router.query;

  const CustomComponent = hasCustomComponent
    ? dynamic(() => import(`../../components/chapter/${pageId}`))
    : null;

  const swipeHandlers = usePageNavigation({
    chapterId: chapterId as string,
    pageId: pageId as string,
    navigation,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        if (
          typeof pageId === "string" &&
          pageId.endsWith("1") &&
          pageId !== "01"
        ) {
          // If it's the second page of a chapter (e.g., 051, 061), go to the main chapter page
          router.push(`/${chapterId}`);
        } else if (navigation.previousPage) {
          router.push(`/${chapterId}/${navigation.previousPage.id}`);
        } else if (navigation.previousChapter) {
          router.push(`/${navigation.previousChapter.id}`);
        }
      } else if (event.key === "ArrowRight") {
        if (navigation.nextPage) {
          router.push(`/${chapterId}/${navigation.nextPage.id}`);
        } else if (navigation.nextChapter) {
          router.push(`/${navigation.nextChapter.id}`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, chapterId, pageId, navigation]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground">
      <div
        {...swipeHandlers}
        className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12"
      >
        <Head>
          <title>{`${title} - ${chapterTitle} - The Next 1.000 Days`}</title>
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
        <div className="w-full">{CustomComponent && <CustomComponent />}</div>
        <Markdown
          content={content}
          chapterId={chapterId as string}
          pageId={pageId as string}
        />
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 hidden">
          Last updated: {lastUpdated}
        </div>
        <div className="flex justify-between mt-8">
          {typeof pageId === "string" &&
          pageId.endsWith("1") &&
          pageId !== "01" ? (
            <Link
              href={`/${chapterId}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Chapter: {chapterTitle}
            </Link>
          ) : navigation.previousPage ? (
            <Link
              href={`/${chapterId}/${navigation.previousPage.id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Previous: {navigation.previousPage.title}
            </Link>
          ) : navigation.previousChapter ? (
            <Link
              href={`/${navigation.previousChapter.id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Previous Chapter: {navigation.previousChapter.title}
            </Link>
          ) : (
            <span></span>
          )}
          {navigation.nextPage ? (
            <Link
              href={`/${chapterId}/${navigation.nextPage.id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Next: {navigation.nextPage.title} →
            </Link>
          ) : navigation.nextChapter ? (
            <Link
              href={`/${navigation.nextChapter.id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Next Chapter: {navigation.nextChapter.title} →
            </Link>
          ) : (
            <span></span>
          )}
        </div>
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

  // Determine previous and next pages/chapters
  const chapters = await getChapters();
  const currentChapterIndex = chapters.findIndex(
    (chapter) => chapter.id === chapterId
  );
  const currentChapter = chapters[currentChapterIndex];

  const currentPageIndex = currentChapter.pages.findIndex(
    (page) => page.id === pageId
  );
  const previousPage =
    currentPageIndex > 0 ? currentChapter.pages[currentPageIndex - 1] : null;
  const nextPage =
    currentPageIndex < currentChapter.pages.length - 1
      ? currentChapter.pages[currentPageIndex + 1]
      : null;
  const previousChapter =
    currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter =
    currentChapterIndex < chapters.length - 1
      ? chapters[currentChapterIndex + 1]
      : null;

  const navigation: PageNavigation = {
    previousPage: previousPage
      ? { id: previousPage.id, title: previousPage.title }
      : null,
    nextPage: nextPage ? { id: nextPage.id, title: nextPage.title } : null,
    previousChapter: currentPageIndex === 0 ? previousChapter : null,
    nextChapter:
      currentPageIndex === currentChapter.pages.length - 1 ? nextChapter : null,
  };

  const stats = fs.statSync(pagePath);
  const lastUpdated = new Date(stats.mtime).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const componentPath = join(
    process.cwd(),
    "src",
    "components",
    "chapter",
    `${pageId}.tsx`
  );
  const hasCustomComponent = existsSync(componentPath);

  return {
    props: {
      title,
      subtitle, // Add this line
      content: lines.slice(subtitle ? 2 : 1).join("\n"), // Modify this line
      chapterTitle,
      navigation,
      lastUpdated,
      hasCustomComponent, // Add this line
    },
  };
};
