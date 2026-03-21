const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");
const { createVanillaExtractPlugin } = require("@vanilla-extract/next-plugin");

const withVanillaExtract = createVanillaExtractPlugin();
const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return withVanillaExtract(
    withNextra({
      basePath: isDev ? "" : "/clover-iiif",
      images: {
        unoptimized: true,
      },
      // Skip ESLint during the docs build; we run lint separately.
      eslint: {
        ignoreDuringBuilds: true,
      },
      output: "export",
    }),
  );
};
