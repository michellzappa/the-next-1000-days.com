import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontSize: {
        base: '18px', // Set the base font size to 18px
      },
      lineHeight: {
        normal: '1.6', // Adjust the default line height
      },
      spacing: {
        'paragraph': '0.75rem', // Reduced from 1rem
      },
      fontFamily: {
        serif: ['Noto Serif', 'serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
