import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import fs from "fs";
import path from "path";
import Markdown from "../../components/Markdown";
import Footer from "../../components/Footer";
import { getChapters } from "../../utils/content";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import dynamic from "next/dynamic";
import { existsSync } from "fs";
import { join } from "path";

interface ChapterProps {
  title: string;
  subtitle: string;
  content: string;
  chapterId: string;
  subPages: Page[];
  navigation: ChapterNavigation;
  hasCustomComponent: boolean;
}

interface Page {
  id: string;
  title: string;
  subtitle: string;
}

interface ChapterNavigation {
  previousChapter: {
    id: string;
    title: string;
    lastPage: string | null;
    lastPageTitle: string | null;
  } | null;
  nextChapter: { id: string; title: string } | null;
}

function getDisplayTitle(pageId: string, chapterId: string) {
  if (pageId.endsWith("0")) {
    return `Chapter ${parseInt(chapterId, 10)}`;
  }
  return `Page ${pageId}`;
}

export default function Chapter({
  title,
  subtitle,
  content,
  chapterId,
  subPages,
  navigation,
  hasCustomComponent,
}: ChapterProps) {
  const router = useRouter();
  const { chapterId: chapterIdQuery } = router.query;

  const { handleNavigation } = usePageNavigation({
    chapterId: chapterIdQuery as string,
    navigation,
    subPages,
  });

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const CustomComponent = hasCustomComponent
    ? dynamic(
        () => import(`../../components/chapter/${chapterId.padStart(2, "0")}0`)
      )
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground">
      <Head>
        <title>{title} - The Next 1.000 Days</title>
        <meta name="description" content={subtitle || "Chapter content"} />
      </Head>
      <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← Home
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
        className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-6"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") handleNavigation("left");
          if (e.key === "ArrowRight") handleNavigation("right");
        }}
        tabIndex={0}
      >
        <Markdown
          content={content}
          chapterId={chapterId}
          pageId={chapterId.padStart(2, "0") + "0"}
        />
        <div className="text-sm text-gray-500 mb-2 font-mono">
          {getDisplayTitle(chapterId.padStart(2, "0") + "0", chapterId)}
        </div>

        {subPages.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Pages</h2>
            {subPages.map((page: Page) => (
              <Link
                key={page.id}
                href={`/${chapterId}/${page.id}`}
                className="block mb-6 border border-transparent hover:border-gray-300 dark:hover:border-gray-700 border-2 rounded-lg p-4 transition duration-150 ease-in-out"
              >
                <div className="flex items-start">
                  <span className="inline-block w-12 text-sm font-mono text-gray-500 dark:text-gray-400 font-bold mr-4">
                    {page.id}
                  </span>
                  <div>
                    <h3 className="text-xl font-medium">{page.title}</h3>
                    {page.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {page.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
        <div className="flex justify-between mt-8">
          {navigation.previousChapter && (
            <Link
              href={
                navigation.previousChapter.lastPage
                  ? `/${navigation.previousChapter.id}/${navigation.previousChapter.lastPage}`
                  : `/${navigation.previousChapter.id}`
              }
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ←
              {navigation.previousChapter.lastPageTitle
                ? navigation.previousChapter.lastPageTitle
                : navigation.previousChapter.title}
            </Link>
          )}
          {subPages.length > 0 && (
            <Link
              href={`/${chapterId}/${subPages[0].id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {subPages[0].title} →
            </Link>
          )}
          {subPages.length === 0 && navigation.nextChapter && (
            <Link
              href={`/${navigation.nextChapter.id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {navigation.nextChapter.title} →
            </Link>
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

  const paths = chapters.map((dir) => ({
    params: { chapterId: dir.split("-")[0] },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const chapterId = params?.chapterId as string;
  const pageId = `${chapterId.padStart(2, "0")}0`;

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
    .sort();

  const mainFile = chapterFiles[0];
  const content = fs.readFileSync(path.join(chapterPath, mainFile), "utf-8");
  const lines = content.split("\n");

  const title = lines[0].startsWith("# ")
    ? lines[0].replace("# ", "").trim()
    : pageId;

  const subtitle = lines[1].startsWith("## ")
    ? lines[1].replace("## ", "").trim()
    : null;

  const contentWithoutTitleAndSubtitle = lines.slice(2).join("\n");

  const subPages = chapterFiles.slice(1).map((file) => {
    const pageContent = fs.readFileSync(path.join(chapterPath, file), "utf-8");
    const lines = pageContent.split("\n");
    const pageTitle = lines[0].replace("# ", "").trim();
    const pageSubtitle = lines[1]?.startsWith("## ")
      ? lines[1].replace("## ", "").trim()
      : null;
    return {
      id: file.replace(".txt", ""),
      title: pageTitle,
      subtitle: pageSubtitle,
    };
  });

  const chapters = await getChapters();
  const currentChapterIndex = chapters.findIndex(
    (chapter) => chapter.id === chapterId
  );

  const navigation: ChapterNavigation = {
    previousChapter:
      currentChapterIndex > 0
        ? {
            id: chapters[currentChapterIndex - 1].id,
            title: chapters[currentChapterIndex - 1].title,
            lastPage:
              chapters[currentChapterIndex - 1].pages.length > 0
                ? chapters[currentChapterIndex - 1].pages[
                    chapters[currentChapterIndex - 1].pages.length - 1
                  ].id
                : null,
            lastPageTitle:
              chapters[currentChapterIndex - 1].pages.length > 0
                ? chapters[currentChapterIndex - 1].pages[
                    chapters[currentChapterIndex - 1].pages.length - 1
                  ].title
                : null,
          }
        : null,
    nextChapter:
      currentChapterIndex < chapters.length - 1
        ? {
            id: chapters[currentChapterIndex + 1].id,
            title: chapters[currentChapterIndex + 1].title,
          }
        : null,
  };

  const componentPath = join(
    process.cwd(),
    "src",
    "components",
    "chapter",
    `${chapterId.padStart(2, "0")}0.tsx`
  );
  const hasCustomComponent = existsSync(componentPath);

  return {
    props: {
      title,
      subtitle,
      content: contentWithoutTitleAndSubtitle,
      chapterId,
      subPages,
      navigation,
      hasCustomComponent,
    },
  };
};
