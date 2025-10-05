import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import fs from "fs";
import path from "path";
import Link from "next/link";
import Markdown from "../../components/Markdown";
import Footer from "../../components/Footer";
import { getMainPageNumber } from "../../utils/pageNumbers";
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
  subtitle,
  content,
  chapterTitle,
  navigation,
  lastUpdated,
  hasCustomComponent,
  isFirstPage,
}: PageProps & {
  lastUpdated: string;
  navigation: PageNavigation;
  hasCustomComponent: boolean;
  isFirstPage: boolean;
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
    isFirstPage,
  });

  // Keydown navigation handled centrally by usePageNavigation

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground">
      <Head>
        <title>{title} - Field Notes from a Centaur</title>
        <meta
          name="description"
          content={subtitle || `${title} - Chapter content`}
        />
      </Head>
      <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href={`/${chapterId}`}
          className="hover:underline mb-4 inline-block"
        >
          ← {`${parseInt(chapterId as string, 10)}. ${chapterTitle}`}
        </Link>
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        {subtitle && <h2 className="text-2xl italic mb-6">{subtitle}</h2>}
      </div>

      {hasCustomComponent && CustomComponent && (
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[70rem] px-4 sm:px-6 lg:px-8 max-h-[70vh] overflow-auto">
            <CustomComponent />
          </div>
        </div>
      )}

      <div
        {...swipeHandlers}
        className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
          <Markdown
            content={content}
            chapterId={chapterId as string}
            pageId={pageId as string}
            subtitle={subtitle || undefined}
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 hidden">
          Last updated: {lastUpdated}
        </div>
        {/* Pagination moved to Footer */}
      </div>
      <Footer
        currentPageNumber={pageId as string}
        chapterId={chapterId as string}
        showRandom
        navLeft={
          isFirstPage
            ? {
                href: `/${chapterId}`,
                number: getMainPageNumber(chapterId as string),
                title: chapterTitle,
              }
            : navigation.previousPage
            ? {
                href: `/${chapterId}/${navigation.previousPage.id}`,
                number: navigation.previousPage.id,
                title: navigation.previousPage.title,
              }
            : navigation.previousChapter
            ? {
                href: `/${navigation.previousChapter.id}`,
                number: getMainPageNumber(navigation.previousChapter.id),
                title: navigation.previousChapter.title,
              }
            : null
        }
        navRight={
          navigation.nextPage
            ? {
                href: `/${chapterId}/${navigation.nextPage.id}`,
                number: navigation.nextPage.id,
                title: navigation.nextPage.title,
              }
            : navigation.nextChapter
            ? {
                href: `/${navigation.nextChapter.id}`,
                number: getMainPageNumber(navigation.nextChapter.id),
                title: navigation.nextChapter.title,
              }
            : null
        }
      />
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
    const chapterId = chapterDir.split("-")[0];
    const mainFile = `${getMainPageNumber(chapterId)}.md`;
    const pages = fs
      .readdirSync(chapterPath)
      .filter((file) => file.endsWith(".md") && file !== mainFile);

    return pages.map((page) => ({
      params: {
        chapterId,
        pageId: page.replace(".md", ""),
      },
    }));
  });

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { getChapters } = await import("../../utils/content");
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
  const pageFile = `${pageId}.md`;
  const pagePath = path.join(chapterPath, pageFile);

  if (!fs.existsSync(pagePath)) {
    return { notFound: true };
  }

  const content = fs.readFileSync(pagePath, "utf-8");
  const lines = content.split("\n");
  const title = lines[0].replace("# ", "");

  // Find the first ## subtitle line, skipping any blank lines
  const subtitleLine = lines.find((line) => line.trim().startsWith("## "));
  const subtitle = subtitleLine ? subtitleLine.replace("## ", "").trim() : null;

  // Get chapter title from the first file in the chapter directory
  const chapterFiles = fs
    .readdirSync(chapterPath)
    .filter((file) => file.endsWith(".md"))
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
  const isFirstPage = currentPageIndex === 0;
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
      content: lines.slice(1).join("\n"), // Remove only the title line, let Markdown component handle subtitle
      chapterTitle,
      navigation,
      lastUpdated,
      hasCustomComponent, // Add this line
      isFirstPage,
    },
  };
};
