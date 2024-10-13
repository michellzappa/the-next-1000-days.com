import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import rehypeRaw from "rehype-raw";
import { remarkVocabPlugin } from "../utils/remarkVocabPlugin";
import { getVocabData } from "../utils/getVocabData";
import VocabCard from "./VocabCard";
import { useEffect } from "react";

interface MarkdownProps {
  content: string;
  chapterId: string;
  pageId?: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content, chapterId, pageId }) => {
  const vocabData = React.useMemo(() => getVocabData(), []);

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

  useEffect(() => {
    const vocabCards = document.querySelectorAll(".vocab-card-wrapper");
    vocabCards.forEach((card) => {
      const imagePath = card.getAttribute("data-image-path");
      if (imagePath) {
        const img = new Image();
        img.onload = () => {
          (card as HTMLElement).style.backgroundImage = `url('${imagePath}')`;
          (card as HTMLElement).style.backgroundSize = "cover";
          (card as HTMLElement).style.opacity = "1";
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${imagePath}`);
          (card as HTMLElement).style.opacity = "1";
        };
        img.src = imagePath;
      }
    });
  }, [processedContent]);

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
    return <img src={src || ""} alt={alt || ""} />;
  };

  return (
    <div className="clearfix">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkVocabPlugin, vocabData]]}
        rehypePlugins={[rehypeRaw]}
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
          }: {
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
          }) => {
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
          VocabCard: ({
            term,
            definition,
          }: {
            term: string;
            definition: string;
          }) => <VocabCard term={term} definition={definition} />,

          // Add this new renderer for the vocab-card
          "vocab-card": ({
            term,
            definition,
            children,
          }: {
            term: string;
            definition: string;
            children?: React.ReactNode;
          }) => (
            <VocabCard term={term} definition={definition}>
              {children}
            </VocabCard>
          ),
          div: ({ className, children, ...props }) => {
            if (className === "vocab-card-wrapper") {
              return (
                <div className="float-right clear-right ml-4 mb-4 w-64 h-96 transition-opacity duration-300">
                  {children}
                </div>
              );
            }
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
