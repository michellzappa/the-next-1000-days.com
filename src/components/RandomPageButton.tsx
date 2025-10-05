import { useState } from "react";
import { useRouter } from "next/router";
import { Shuffle } from "lucide-react";

interface RandomPageButtonProps {
  className?: string;
}

export default function RandomPageButton({
  className = "",
}: RandomPageButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRandomPage = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/random-page");
      if (response.ok) {
        const randomPage = await response.json();
        router.push(`/${randomPage.chapterId}/${randomPage.pageId}`);
      } else {
        console.error("Failed to fetch random page");
      }
    } catch (error) {
      console.error("Error fetching random page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRandomPage}
      disabled={isLoading}
      className={`inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 ${className}`}
      title="Go to random page"
    >
      <Shuffle size={14} className={isLoading ? "animate-spin" : ""} />
      Random
    </button>
  );
}
