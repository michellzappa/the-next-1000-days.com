import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import fs from "fs";
import path from "path";
import Markdown from "../../components/Markdown";
import Footer from "../../components/Footer";
// Random button not used on chapter landing
// removed duplicate type import
import {
  getMainPageNumber,
  formatDisplayNumber,
  formatChapterNumber,
} from "../../utils/pageNumbers";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import dynamic from "next/dynamic";
import { existsSync } from "fs";
import { join } from "path";
import {
  getNavigationContext as getServerNavigationContext,
  getNavigationUrl,
  getNavigationDisplayNumber,
} from "../../utils/navigation";

interface ChapterProps {
  title: string;
  subtitle: string;
  content: string;
  chapterId: string;
  subPages: Page[];
  hasCustomComponent: boolean;
  mainPageNumber: string;
  componentImportPath: string | null;
  navLeft?: { href: string; number: string; title: string } | null;
  navRight?: { href: string; number: string; title: string } | null;
}

interface Page {
  id: string;
  title: string;
  subtitle: string;
}

// helper removed (unused)

export default function Chapter({
  title,
  subtitle,
  content,
  chapterId,
  subPages,
  hasCustomComponent,
  mainPageNumber,
  componentImportPath,
  navLeft,
  navRight,
}: ChapterProps) {
  const router = useRouter();
  const { chapterId: chapterIdQuery } = router.query;

  const { handleNavigation } = usePageNavigation({
    chapterId: chapterIdQuery as string,
  });

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const CustomComponent = hasCustomComponent
    ? dynamic(
        () =>
          import(
            `../../components/chapter/${componentImportPath || mainPageNumber}`
          )
      )
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground">
      <Head>
        <title>{`${parseInt(
          chapterId,
          10
        )}. ${title} - Field Notes from a Centaur`}</title>
        <meta name="description" content={subtitle || "Chapter content"} />
      </Head>
      <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/" className="hover:underline mb-4 inline-block">
          ← Home
        </Link>
        <h1 className="text-4xl font-bold mb-2">{`${parseInt(
          chapterId,
          10
        )}. ${title}`}</h1>
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
          pageId={mainPageNumber}
        />

        {subPages.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-3">Pages</h2>
            {subPages.map((page: Page) => (
              <Link
                key={page.id}
                href={`/${chapterId}/${page.id}`}
                className="block border border-transparent hover:border-gray-300 dark:hover:border-gray-700 border-2 rounded-lg p-3 transition duration-150 ease-in-out"
              >
                <div className="flex items-start">
                  <span className="inline-block w-12 text-sm font-mono text-gray-500 dark:text-gray-400 font-bold mr-4">
                    {formatDisplayNumber(page.id)}
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
        {/* Pagination moved to Footer */}
      </div>
      <Footer
        currentPageNumber={formatChapterNumber(chapterId)}
        navLeft={navLeft || null}
        navRight={navRight || null}
        showRandom
      />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const contentDir = path.join(process.cwd(), "content");
  const chapters = fs
    .readdirSync(contentDir)
    .filter((dir) => /^\d{1,3}-/.test(dir))
    .filter((dir) => !dir.startsWith("0-"));

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

  // Find the main chapter page based on the new numbering system
  const mainPageNumber = getMainPageNumber(chapterId);

  const mainFile = `${mainPageNumber}.md`;
  const content = fs.readFileSync(path.join(chapterPath, mainFile), "utf-8");
  const lines = content.split("\n");

  const titleLine = lines[0].startsWith("# ")
    ? lines[0].replace("# ", "")
    : pageId;
  const title = titleLine.replace(/<!--[\s\S]*?-->/g, "").trim();

  // Find the first ## subtitle line, skipping any blank lines
  const subtitleLine = lines.find((line) => line.trim().startsWith("## "));
  const subtitle = subtitleLine ? subtitleLine.replace("## ", "").trim() : null;

  // Get content starting after the title and subtitle lines
  const subtitleIndex = lines.findIndex((line) =>
    line.trim().startsWith("## ")
  );
  const contentStartIndex = subtitleIndex >= 0 ? subtitleIndex + 1 : 1;
  const contentWithoutTitleAndSubtitle = lines
    .slice(contentStartIndex)
    .join("\n");

  const subPages = fs
    .readdirSync(chapterPath)
    .filter((file) => file.endsWith(".md") && file !== mainFile)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map((file) => {
      const pageContent = fs.readFileSync(
        path.join(chapterPath, file),
        "utf-8"
      );
      const lines = pageContent.split("\n");
      const pageTitle = lines[0].replace("# ", "").trim();

      // Find the first ## subtitle line, skipping any blank lines
      const pageSubtitleLine = lines.find((line) =>
        line.trim().startsWith("## ")
      );
      const pageSubtitle = pageSubtitleLine
        ? pageSubtitleLine.replace("## ", "").trim()
        : null;
      return {
        id: file.replace(".md", ""),
        title: pageTitle,
        subtitle: pageSubtitle,
      };
    });

  const chapterSpecificPath = join(
    process.cwd(),
    "src",
    "components",
    "chapter",
    `${chapterId}-${mainPageNumber}.tsx`
  );
  const genericPath = join(
    process.cwd(),
    "src",
    "components",
    "chapter",
    `${mainPageNumber}.tsx`
  );
  const hasCustomComponent =
    existsSync(chapterSpecificPath) || existsSync(genericPath);
  const componentImportPath = existsSync(chapterSpecificPath)
    ? `${chapterId}-${mainPageNumber}`
    : existsSync(genericPath)
    ? `${mainPageNumber}`
    : null;

  // Precompute navigation to avoid client-side flash
  const navCtx = await getServerNavigationContext(chapterId);
  const navLeft = navCtx.previous
    ? {
        href: getNavigationUrl(navCtx.previous),
        number: getNavigationDisplayNumber(navCtx.previous),
        title: navCtx.previous.title,
      }
    : null;
  const navRight = navCtx.next
    ? {
        href: getNavigationUrl(navCtx.next),
        number: getNavigationDisplayNumber(navCtx.next),
        title: navCtx.next.title,
      }
    : null;

  return {
    props: {
      title,
      subtitle,
      content: contentWithoutTitleAndSubtitle,
      chapterId,
      subPages,
      hasCustomComponent,
      mainPageNumber,
      componentImportPath,
      navLeft,
      navRight,
    },
  };
};
