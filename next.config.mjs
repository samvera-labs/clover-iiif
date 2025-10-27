import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

import nextra from 'nextra';

const withNextra = nextra({});

export default (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return withNextra({
    basePath: isDev ? "" : "/clover-iiif",
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
