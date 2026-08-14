const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");
const { version } = require("./package.json");

const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return withNextra({
    basePath: isDev ? "" : "/clover-iiif",
    /*
     * The version the homepage badge shows, taken from package.json so a release bump
     * carries into the docs on its own.
     *
     * Injected here rather than imported in the component: an `import` of package.json
     * pulls the whole file into the client bundle — every dependency, script and field —
     * because webpack does not reliably tree-shake JSON named imports. `env` inlines just
     * this string at build time.
     *
     * next.config.js is read once at startup, so a version bump needs a dev-server
     * restart to appear. Builds always read it fresh.
     */
    env: {
      NEXT_PUBLIC_CLOVER_VERSION: version,
    },
    images: {
      unoptimized: true,
    },
    // Skip ESLint during the docs build; we run lint separately.
    eslint: {
      ignoreDuringBuilds: true,
    },
    output: "export",
  });
};
