import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import PlausibleProvider from "next-plausible";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PlausibleProvider
      domain="the-next-1000-days.vercel.app, the-next-1000-days.com"
      trackLocalhost={false} // Set to true if you want to track localhost during development
    >
      <ThemeProvider attribute="class">
        <Component {...pageProps} />
      </ThemeProvider>
    </PlausibleProvider>
  );
}
