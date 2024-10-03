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
}

export default function Page({ title, content }: PageProps) {
  const router = useRouter();
  const { chapterId, pageId } = router.query;

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col p-8 pb-20 gap-16 sm:p-20 bg-white dark:bg-gray-900 text-black dark:text-white">
      <Head>
        <title>{title || "Untitled Page"} - The Next 1,000 Days</title>
      </Head>
      <Link
        href={`/${chapterId}`}
        className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
      >
        ← Back to Chapter
      </Link>
      <Markdown
        content={content}
        chapterId={chapterId as string}
        pageId={pageId as string}
      />
      <Footer />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const contentDir = path.join(process.cwd(), "content");
  const chapters = fs
    .readdirSync(contentDir)
    .filter((dir) => /^\d{2}-/.test(dir));

  const paths = chapters.flatMap((chapterDir) => {
    const chapterId = chapterDir.split("-")[0];
    const chapterPath = path.join(contentDir, chapterDir);
    const pages = fs
      .readdirSync(chapterPath)
      .filter((file) => file.endsWith(".txt"));

    return pages.map((page) => ({
      params: { chapterId, pageId: page.replace(".txt", "") },
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
  const filePath = path.join(chapterPath, `${pageId}.txt`);

  if (!fs.existsSync(filePath)) {
    return { notFound: true };
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const title = lines[0].replace("# ", "").trim() || null;

  return {
    props: {
      title,
      content: lines.slice(1).join("\n").trim(),
    },
  };
};
