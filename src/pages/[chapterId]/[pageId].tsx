import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import fs from "fs";
import path from "path";
import Link from "next/link";
import Markdown from "../../components/Markdown";
import Footer from "../../components/Footer";
import {
  getMainPageNumber,
  formatDisplayNumber,
} from "../../utils/pageNumbers";
import {
  getNavigationContext as getServerNavigationContext,
  getNavigationUrl,
  getNavigationDisplayNumber,
} from "../../utils/navigation";
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
  navLeft?: { href: string; number: string; title: string } | null;
  navRight?: { href: string; number: string; title: string } | null;
  componentImportPath?: string | null;
}

export default function Page({
  title,
  subtitle,
  content,
  chapterTitle,
  lastUpdated,
  hasCustomComponent,
  componentImportPath,
  navLeft,
  navRight,
}: PageProps & {
  lastUpdated: string;
  hasCustomComponent: boolean;
}) {
  const router = useRouter();
  const { chapterId, pageId } = router.query;

  const CustomComponent = hasCustomComponent && componentImportPath
    ? dynamic(() => import(`../../components/chapter/${componentImportPath}`))
    : null;

  const { handleNavigation } = usePageNavigation({
    chapterId: chapterId as string,
    pageId: pageId as string,
  });

  // Keydown navigation handled centrally by usePageNavigation

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground">
      <Head>
        <title>{`${title} - Field Notes from a Centaur`}</title>
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
        className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-6"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") handleNavigation("left");
          if (e.key === "ArrowRight") handleNavigation("right");
        }}
        tabIndex={0}
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
        currentPageNumber={formatDisplayNumber(
          pageId as string,
          chapterId as string
        )}
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
    .filter((dir) => /^(\d{1,3}|about)-/.test(dir))
    .filter((dir) => !dir.startsWith("0-"));

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
  const rawTitle = lines[0].replace("# ", "");
  const title = rawTitle.replace(/<!--[\s\S]*?-->/g, "").trim();

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
  const chapterTitle = chapterContent
    .split("\n")[0]
    .replace("# ", "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  const stats = fs.statSync(pagePath);
  const lastUpdated = new Date(stats.mtime).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const chapterSpecificPath = join(
    process.cwd(),
    "src",
    "components",
    "chapter",
    `${chapterId}-${pageId}.tsx`
  );
  const genericPath = join(
    process.cwd(),
    "src",
    "components",
    "chapter",
    `${pageId}.tsx`
  );
  const hasCustomComponent =
    existsSync(chapterSpecificPath) || existsSync(genericPath);
  const componentImportPath = existsSync(chapterSpecificPath)
    ? `${chapterId}-${pageId}`
    : existsSync(genericPath)
    ? pageId
    : null;

  // Precompute navigation to avoid client-side flash
  const navCtx = await getServerNavigationContext(chapterId, pageId);
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
      content: lines.slice(1).join("\n"),
      chapterTitle,
      lastUpdated,
      hasCustomComponent,
      componentImportPath,
      navLeft,
      navRight,
    },
  };
};
