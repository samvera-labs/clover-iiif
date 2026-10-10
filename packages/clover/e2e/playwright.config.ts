import { defineConfig, devices } from "@playwright/test";

/**
 * @nulib/clover end to end, on Chromium, WebKit and Firefox (React 18), on WebKit at
 * iPhone size with touch, and on Chromium
 * with React 19 (`e2e/react19`, its own install): `npm run e2e -w @nulib/clover`.
 * The harness is served by Vite over the package's source; every IIIF resource and image
 * is served from disk by routing (`specs/fixtures.ts`), so nothing reaches the network.
 */
export default defineConfig({
  testDir: "specs",
  fullyParallel: true,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4321", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // A phone: WebKit at iPhone size, with touch. Phone-only specs skip elsewhere.
    { name: "iphone", use: { ...devices["iPhone 15"] } },
    {
      name: "react19",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:4322" },
    },
  ],
  webServer: [
    {
      command: "npx vite --config e2e/vite.config.mjs",
      cwd: "..",
      url: "http://localhost:4321",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npx vite --config e2e/vite.react19.config.mjs",
      cwd: "..",
      url: "http://localhost:4322",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
