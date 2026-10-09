/*
 * Clover's own stylesheet.
 *
 * The docs consume the library from source, outside the package's Vite build that discovers
 * colocated component CSS. Import the aggregate explicitly here because Next's Pages Router
 * only allows a global stylesheet in `_app`.
 */
import "src/styles/clover.css";

import "docs/styles/fonts.css";
import "docs/styles/layout.css";
import "docs/styles/tokens.css";

import type { AppProps } from "next/app";
import { defaultFontFamily } from "docs/lib/preview-fonts";
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

  /*
   * Lora is the site's default face. `next/font` generates its family name, so it cannot
   * be written into tokens.css; declaring it here puts it in the server-rendered page,
   * so the first paint is already in Lora. `--font-sans` reads it from there.
   */
  return (
    <>
      {/*
       * Set as raw CSS rather than a text child: React escapes the family's quotes in
       * server HTML but not on the client, and the mismatch fails hydration. The value
       * is `next/font`'s own build-time output, never user input.
       */}
      <style
        dangerouslySetInnerHTML={{
          __html: `:root { --font-default: ${defaultFontFamily}; }`,
        }}
      />
      <Component {...pageProps} />
    </>
  );
}
