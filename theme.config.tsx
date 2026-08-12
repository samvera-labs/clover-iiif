import { DocsThemeConfig } from "nextra-theme-docs";
import Logo from "./docs/components/Logo";
import React from "react";
import TitleComponent from "./docs/components/TitleComponent";
import { useConfig } from "nextra-theme-docs";
import { useMemo } from "react";
import { useRouter } from "next/router";

const siteTitle = "Clover IIIF";
const siteDescription = "Showcase IIIF Manifests as interoperable web content.";

const config: DocsThemeConfig = {
  darkMode: true,
  nextThemes: {
    defaultTheme: "system",
  },
  docsRepositoryBase: "https://github.com/samvera-labs/clover-iiif",

  banner: {
    // tada icon and react 19 support notification
    text: "🎉 React 19 support is here! Clover IIIF v3.0.0 works with the latest React frameworks.",
    dismissible: true,
  },
  footer: {
    text: "Extensible IIIF front-end toolkit and Manifest viewer. Accessible. Composable. Open Source.",
  },

  useNextSeoProps() {
    const config = useConfig();
    const title = config.frontMatter.title
      ? `${config.frontMatter.title} – ${siteTitle}`
      : `${siteTitle} – ${siteDescription}`;
    const description = config.frontMatter.description
      ? config.frontMatter.description
      : siteDescription;

    const { route } = useRouter();
    const canonical = useMemo(
      () =>
        new URL(
          route.endsWith("/") ? route : `${route}/`,
          "https://samvera-labs.github.io/clover-iiif/",
        ).href,
      [route],
    );

    return {
      defaultTitle: `${siteTitle} - ${siteDescription}`,
      title,
      description,
      canonical,
      openGraph: {
        url: canonical,
        title,
        siteName: `${siteTitle} - ${siteDescription}`,
        images: [
          {
            url: "",
            type: "image/png",
            width: 1200,
            height: 675,
          },
        ],
      },
      twitter: {
        cardType: "summary_large_image",
      },
    };
  },
  logo: <Logo />,
  project: {
    link: "https://github.com/samvera-labs/clover-iiif",
  },
  /*
   * #3A5BC7 = hsl(226 56% 50%). Nextra bakes its own lightness per utility and reads
   * only these two, so the saturation has to be set alongside the hue — left at its
   * default of 100% the accent renders fluorescent.
   * Kept in step with `--accent-9` in docs/styles/tokens.css.
   */
  primaryHue: 226,
  primarySaturation: 56,
  sidebar: {
    autoCollapse: true,
    defaultMenuCollapseLevel: 1,
    titleComponent: (props) => <TitleComponent {...props} />,
    toggleButton: true,
  },
};

export default config;
