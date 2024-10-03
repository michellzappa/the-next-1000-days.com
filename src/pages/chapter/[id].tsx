import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import Navigation from "../../components/Navigation";
import fs from "fs";
import path from "path";

interface ChapterProps {
  title: string;
  content: string;
}

export default function Chapter({ title, content }: ChapterProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <Navigation />
      <h1 className="text-4xl font-bold mb-8">{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const contentDir = path.join(process.cwd(), "content");
  const chapters = fs
    .readdirSync(contentDir)
    .filter((dir) => /^\d{2}-/.test(dir));

  const paths = chapters.map((dir) => ({
    params: { id: dir.split("-")[0] },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const chapterId = params?.id as string;
  const contentDir = path.join(process.cwd(), "content");
  const chapterDir = fs
    .readdirSync(contentDir)
    .find((dir) => dir.startsWith(`${chapterId}-`));

  if (!chapterDir) {
    return { notFound: true };
  }

  const chapterPath = path.join(contentDir, chapterDir);
  const chapterFiles = fs.readdirSync(chapterPath);
  const mainFile =
    chapterFiles.find((file) => file.startsWith(`${chapterId}0.`)) ||
    chapterFiles[0];

  const content = fs.readFileSync(path.join(chapterPath, mainFile), "utf-8");
  const title = content.split("\n")[0].replace("# ", "");

  return {
    props: {
      title,
      content: content.split("\n").slice(1).join("\n"),
    },
  };
};
