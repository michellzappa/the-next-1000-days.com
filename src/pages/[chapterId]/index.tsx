import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import fs from "fs";
import path from "path";
import Markdown from "../../components/Markdown";
import Footer from "../../components/Footer";

interface ChapterProps {
  title: string;
  subtitle: string; // Added subtitle property
  content: string; // Replace 'any' with 'string'
  chapterId: string;
  subPages: Page[]; // Replace 'any' with 'Page[]'
}

// Move the Page interface definition up here
interface Page {
  id: string;
  title: string;
  subtitle: string; // Added subtitle property
}

function getDisplayTitle(pageId: string, chapterId: string) {
  // Check if the pageId is a chapter intro page (e.g., 010, 020)
  if (pageId.endsWith("0")) {
    return `Chapter ${parseInt(chapterId, 10)}`;
  }
  // Return the page number for other pages
  return `Page ${pageId}`;
}

export default function Chapter({
  title,
  subtitle,
  content,
  chapterId,
  subPages,
}: ChapterProps) {
  const pageId = `${chapterId.padStart(2, "0")}0`;
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground">
      <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <Head>
          <title>{`${getDisplayTitle(
            pageId,
            chapterId
          )} - The Next 1,000 Days`}</title>
        </Head>
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← Back to Home
        </Link>
        <div className="text-sm text-gray-500 mb-2">
          {getDisplayTitle(pageId, chapterId)}
        </div>
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        {subtitle && (
          <h2 className="text-2xl font-semibold mb-6">{subtitle}</h2>
        )}
        <Markdown content={content} chapterId={chapterId} pageId={pageId} />
        {subPages.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Pages</h2>
            {subPages.map((page: Page) => (
              <Link
                key={page.id}
                href={`/${chapterId}/${page.id}`}
                className="block mb-6 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-4 transition duration-150 ease-in-out"
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

  // Extract the title and ensure it's a single string
  const title = lines[0].startsWith("# ")
    ? lines[0].replace("# ", "").trim()
    : pageId;

  // Extract the subtitle
  const subtitle = lines[1].startsWith("## ")
    ? lines[1].replace("## ", "").trim()
    : null;

  // Remove the title and subtitle lines from the content
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

  return {
    props: {
      title,
      subtitle,
      content: contentWithoutTitleAndSubtitle,
      chapterId,
      pageId,
      subPages,
    },
  };
};
