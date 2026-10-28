import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against the STATIC EXPORT in ./out (build first: `npm run build`),
 * served by scripts/serve-out.mjs exactly the way Cloudflare Pages would serve it.
 *
 * To test a deployment instead: BASE_URL=https://bonfireos.pages.dev npm run test:e2e
 */
const PORT = 4173;
const BASE_URL = process.env.BASE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "qa/playwright-report" }]],
  outputDir: "qa/test-results",
  timeout: 45_000,
  use: {
    baseURL: BASE_URL ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  webServer: BASE_URL
    ? undefined
    : {
        command: "node scripts/serve-out.mjs",
        port: PORT,
        reuseExistingServer: true,
        timeout: 30_000,
      },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
