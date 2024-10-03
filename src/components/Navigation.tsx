import Link from "next/link";
import { useState, useEffect } from "react";

interface Page {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  pages: Page[];
}

const Navigation = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    fetch("/api/chapters")
      .then((res) => res.json())
      .then((data) => setChapters(data));
  }, []);

  return (
    <nav className="mb-8">
      <ul className="space-y-4">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <Link
              href={`/chapter/${chapter.id}`}
              className="text-xl font-semibold hover:underline"
            >
              {chapter.title}
            </Link>
            <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
