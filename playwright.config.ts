import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import { TestOptions, authFile } from "./tests/fixtures/lxd-test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// provide environment variables from .env.local to all tests
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig<TestOptions> = {
  testDir: "./tests",
  /* Maximum time one test can run for. */
  timeout: 120_000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 120_000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? "blob" : "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    baseURL: "https://localhost:8407/",
    ignoreHTTPSErrors: true,
    video: "retain-on-failure",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  // Limit the number of failures on CI to save resources
  maxFailures: process.env.CI ? 3 : undefined,

  /* Configure projects for major browsers */
  projects: [
    // Setup project
    {
      name: "setup-chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "setup-firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium:lxd-5.0-edge",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "5.0-edge",
      },
    },
    {
      name: "firefox:lxd-5.0-edge",
      use: {
        ...devices["Desktop Firefox"],
        lxdVersion: "5.0-edge",
      },
    },
    {
      name: "chromium:lxd-5.21-edge",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "5.21-edge",
        storageState: authFile,
      },
      dependencies: ["setup-chromium"],
    },
    {
      name: "firefox:lxd-5.21-edge",
      use: {
        ...devices["Desktop Firefox"],
        lxdVersion: "5.21-edge",
        storageState: authFile,
      },
      dependencies: ["setup-firefox"],
    },
    {
      name: "chromium:lxd-latest-edge",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "latest-edge",
        storageState: authFile,
      },
      dependencies: ["setup-chromium"],
    },
    {
      name: "firefox:lxd-latest-edge",
      use: {
        ...devices["Desktop Firefox"],
        lxdVersion: "latest-edge",
        storageState: authFile,
      },
      dependencies: ["setup-firefox"],
    },
    {
      name: "coverage",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "latest-edge",
        storageState: authFile,
        hasCoverage: true,
      },
      dependencies: ["setup-chromium"],
    },
  ],
};

export default config;
