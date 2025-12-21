import type { AppProps } from "next/app";

export default function CloverDocsApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
