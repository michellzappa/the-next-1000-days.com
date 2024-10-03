import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import fs from "fs";
import path from "path";
import Markdown from "../../components/Markdown";
import Footer from "../../components/Footer";

// Remove the unused SubPage interface
// interface SubPage { ... }

interface ChapterProps {
  title: string;
  content: string; // Replace 'any' with 'string'
  chapterId: string;
  subPages: Page[]; // Replace 'any' with 'Page[]'
}

// Move the Page interface definition up here
interface Page {
  id: string;
  title: string;
}

export default function Chapter({
  title,
  content,
  chapterId,
  subPages,
}: ChapterProps) {
  const pageId = `${chapterId.padStart(2, "0")}0`;
  const router = useRouter();
  // Remove the unused chapterIdQuery
  // const { chapterId: chapterIdQuery } = router.query;

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <Head>
          <title>{title || pageId} - The Next 1,000 Days</title>{" "}
          {/* Update this line */}
        </Head>
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-bold mb-8">{title || pageId}</h1>{" "}
        {/* Update this line */}
        <Markdown
          content={content}
          chapterId={chapterId}
          pageId={pageId} // Pass the correct pageId for chapter intros
        />
        {subPages.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Pages</h2>
            {subPages.map((page: Page) => (
              <div key={page.id} className="mb-6">
                <Link
                  href={`/${chapterId}/${page.id}`}
                  className="text-xl font-medium hover:underline"
                >
                  <span className="inline-block w-12 font-mono text-gray-500">
                    {page.id}
                  </span>
                  {page.title}
                </Link>
              </div>
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
  const pageId = `${chapterId.padStart(2, "0")}0`; // Ensure this is correct for chapter intros

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
  const title = lines[0].startsWith("# ") ? lines[0].replace("# ", "") : pageId; // Update this line

  const subPages = chapterFiles.slice(1).map((file) => {
    const pageContent = fs.readFileSync(path.join(chapterPath, file), "utf-8");
    const pageTitle = pageContent.split("\n")[0].replace("# ", "");
    return { id: file.replace(".txt", ""), title: pageTitle };
  });

  return {
    props: {
      title, // Add this line
      content: lines.slice(1).join("\n"),
      chapterId,
      pageId, // Include pageId in the props
      subPages,
    },
  };
};
