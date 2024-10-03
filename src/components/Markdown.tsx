import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

interface MarkdownProps {
  content: string;
  chapterId: string;
  pageId?: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content, chapterId, pageId }) => {
  const processedContent = React.useMemo(() => {
    const chapterNumber = chapterId.padStart(3, "0");
    // Ensure pageId is always set, defaulting to chapterNumber + "0" if not provided
    const pageNumber = pageId || `${chapterNumber}0`;

    const indicator = `**${pageId ? "Page" : "Chapter"} ${pageNumber}**`;

    const processedContent = `${indicator}\n\n${content}`;

    return processedContent.replace(
      /^(.+\.(webp|jpg|png|gif))$/gm,
      (match, fileName) => {
        const imagePath = `/images/chapters/${pageNumber}/${fileName}`;
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
    return (
      <Image
        src={src || ""}
        alt={alt || ""}
        width={800}
        height={600}
        layout="responsive"
      />
    );
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (props) => (
          <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
        ),
        h2: (props) => (
          <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />
        ),
        h3: (props) => (
          <h3 className="text-xl font-medium mt-4 mb-2" {...props} />
        ),
        p: (props) => <p className="mb-3" {...props} />,
        ul: (props) => <ul className="list-disc pl-5 mb-4" {...props} />,
        ol: (props) => <ol className="list-decimal pl-5 mb-4" {...props} />,
        li: (props) => <li className="mb-1" {...props} />,
        a: (props) => (
          <a
            className="text-blue-600 dark:text-blue-400 hover:underline"
            {...props}
          />
        ),
        blockquote: (props) => (
          <blockquote
            className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4"
            {...props}
          />
        ),
        code: ({
          inline,
          className,
          children,
          ...props
        }: {
          inline?: boolean;
          className?: string;
          children?: React.ReactNode; // Make children optional
        }) => {
          // Removed the 'match' variable
          return !inline ? (
            <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 overflow-x-auto">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          ) : (
            <code
              className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5"
              {...props}
            >
              {children}
            </code>
          );
        },
        img: customImageRenderer,
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default Markdown;
