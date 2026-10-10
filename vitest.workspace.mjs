/**
 * Two test projects: the 3.x library (`@samvera/clover-iiif`, the root config) and the
 * 4.x package (`@nulib/clover`, its own config, relative imports only).
 */
export default [
  { extends: "./vitest.config.mjs", test: { name: "clover-iiif" } },
  "./packages/clover/vitest.config.mjs",
];
