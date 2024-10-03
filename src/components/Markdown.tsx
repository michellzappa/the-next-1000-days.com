import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { useRouter } from "next/router";

interface MarkdownProps {
  content: string;
  chapterId: string;
  pageId?: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content, chapterId, pageId }) => {
  const router = useRouter();
  const { pageId: queryPageId } = router.query;

  // Pre-process the content to replace image placeholders and add chapter/page indicator
  const processedContent = React.useMemo(() => {
    const chapterNumber = chapterId.padStart(3, "0");
    const pageNumber = pageId ? pageId.padStart(3, "0") : null;

    let indicator = pageNumber
      ? `**Page ${pageNumber}**`
      : `**Chapter ${chapterNumber}**`;

    let processedContent = `${indicator}\n\n${content}`;

    return processedContent.replace(
      /^(.+\.(webp|jpg|png|gif))$/gm,
      (match, fileName) => {
        const imagePath = `/images/chapters/${
          pageNumber || chapterNumber
        }/${fileName}`;
        return `![${fileName}](${imagePath})`;
      }
    );
  }, [content, chapterId, pageId]);

  const customImageRenderer = (props: { src?: string; alt?: string }) => {
    const { src, alt } = props;
    if (src && src.startsWith("/images/chapters/")) {
      return (
        <Image
          src={src}
          alt={alt || ""}
          width={800}
          height={600}
          layout="responsive"
        />
      );
    }
    // For other image formats, use default rendering
    return <img src={src} alt={alt} />;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-xl font-medium mt-4 mb-2" {...props} />
        ),
        p: ({ node, ...props }) => <p className="mb-3" {...props} />,
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-5 mb-4" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal pl-5 mb-4" {...props} />
        ),
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        a: ({ node, ...props }) => (
          <a
            className="text-blue-600 dark:text-blue-400 hover:underline"
            {...props}
          />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4"
            {...props}
          />
        ),
        code: ({
          node,
          inline,
          ...props
        }: {
          node: any;
          inline?: boolean;
          [key: string]: any;
        }) =>
          inline ? (
            <code
              className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5"
              {...props}
            />
          ) : (
            <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 overflow-x-auto">
              <code {...props} />
            </pre>
          ),
        img: customImageRenderer,
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default Markdown;
