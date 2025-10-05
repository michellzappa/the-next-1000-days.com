import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import rehypeRaw from "rehype-raw";

interface MarkdownProps {
  content: string;
  chapterId: string;
  pageId?: string;
  subtitle?: string;
}

const Markdown: React.FC<MarkdownProps> = ({
  content,
  chapterId,
  pageId,
  subtitle,
}) => {
  const processedContent = React.useMemo(() => {
    const chapterNumber = chapterId.padStart(3, "0");
    const pageNumber = pageId || `${chapterNumber}0`;

    // Remove the chapter and page indicators
    return content.replace(
      /^(.+\.(webp|jpg|jpeg|png|gif))$/gm,
      (match, fileName) => {
        const imagePath = `/images/chapters/${pageNumber}/${fileName}`;
        return `![${fileName}](${imagePath})`;
      }
    );
  }, [content, chapterId, pageId]);

  const customImageRenderer = (props: { src?: string; alt?: string }) => {
    const { src, alt } = props;
    if (src && src.startsWith("/images/chapters/")) {
      const isMeme = src.split("/").pop()?.startsWith("meme_");
      const isGif = src.endsWith(".gif");
      return (
        <span
          className={
            isMeme ? "block w-2/3 mx-auto mt-12 mb-12" : "block w-full"
          }
        >
          <Image
            src={src}
            alt={alt || ""}
            width={800}
            height={600}
            style={{ width: "100%", height: "auto" }}
            unoptimized={isGif}
          />
        </span>
      );
    }
    // For other image formats, use default rendering
    return (
      <Image
        src={src || ""}
        alt={alt || ""}
        width={800}
        height={600}
        style={{ width: "100%", height: "auto" }}
      />
    );
  };

  return (
    <div className="clearfix">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: (props) => (
            <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
          ),
          h2: (props) => {
            // Skip rendering h2 if it matches the subtitle
            if (
              subtitle &&
              props.children &&
              typeof props.children === "string" &&
              props.children.trim() === subtitle.trim()
            ) {
              return null;
            }
            return (
              <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />
            );
          },
          h3: (props) => (
            <h3 className="text-xl font-medium mt-4 mb-2" {...props} />
          ),
          p: ({ children }) => {
            // Check if the paragraph contains only an image
            if (
              React.Children.count(children) === 1 &&
              React.isValidElement(children) &&
              children.type === "img"
            ) {
              return <>{children}</>;
            }
            return <p className="mb-3">{children}</p>;
          },
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
          }: React.PropsWithChildren<{
            inline?: boolean;
            className?: string;
          }>) => {
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
          span: ({ className, ...props }) => {
            if (className === "mono") {
              return (
                <span className="font-mono" {...props}>
                  {props.children}
                </span>
              );
            }
            return <span {...props}>{props.children}</span>;
          },
          div: ({ children, ...props }) => {
            return <div {...props}>{children}</div>;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;
