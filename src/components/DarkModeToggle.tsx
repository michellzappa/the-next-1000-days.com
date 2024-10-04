import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const DarkModeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, [theme]);

  if (!mounted) return null;

  return (
    <button
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
      onClick={() => {
        console.log(`Button clicked, current theme: ${theme}`);
        setTheme(theme === "dark" ? "light" : "dark");
      }}
    >
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  );
};

export default DarkModeToggle;
