import "docs/styles/fonts.css";
import "docs/styles/tokens.css";

import type { AppProps } from "next/app";
import { restorePageTheme } from "docs/lib/page-theme";
import { useEffect } from "react";

export default function CloverDocsApp({ Component, pageProps }: AppProps) {
  /*
   * Reapply the reader's accent and font on every cold load.
   *
   * The playground writes both to the document root, but it only mounts on the homepage —
   * so without this, choosing an accent and then navigating into the docs dropped it, and
   * the stored value was never honored again. Runs in an effect because `localStorage` is
   * unreachable during SSR, which means a frame of the default theme before it applies.
   */
  useEffect(() => {
    restorePageTheme();
  }, []);

  return <Component {...pageProps} />;
}
