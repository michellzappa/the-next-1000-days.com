import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import PlausibleProvider from "next-plausible";
import GlobalNavigation from "../components/GlobalNavigation";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PlausibleProvider
      domain="centaur-labs.io, michellzappa.com"
      trackLocalhost={false} // Set to true if you want to track localhost during development
    >
      <ThemeProvider attribute="class">
        <GlobalNavigation>
          <Component {...pageProps} />
        </GlobalNavigation>
      </ThemeProvider>
    </PlausibleProvider>
  );
}
