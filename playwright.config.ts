import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import type { TestOptions } from "./tests/fixtures/lxd-test";
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
  reporter: [
    [
      process.env.CI ? "blob" : "html",
      { fileName: process.env.CI ? "report.zip" : "index.html" },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    baseURL: "https://localhost:8407/",
    ignoreHTTPSErrors: true,
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  // Limit the number of failures on CI to save resources
  maxFailures: process.env.CI ? 3 : undefined,

  /* Configure projects for major browsers */
  projects: [
    // ensure login tests run first since we need to remove the tls certificate from lxd trust store
    {
      name: "login-chromium",
      // disable tracing, to be sure no password will be on the trace
      use: { ...devices["Desktop Chrome"], trace: "off" },
      testMatch: "login.spec.ts",
    },
    {
      name: "login-firefox",
      // disable tracing, to be sure no password will be on the trace
      use: { ...devices["Desktop Firefox"], trace: "off" },
      testMatch: "login.spec.ts",
    },
    {
      name: "enable-clustering-chrome",
      // enable clustering for subsequent tests
      use: { ...devices["Desktop Chrome"] },
      testMatch: "enable-clustering.spec.ts",
    },
    {
      name: "enable-clustering-firefox",
      // enable clustering for subsequent tests
      use: { ...devices["Desktop Firefox"] },
      testMatch: "enable-clustering.spec.ts",
    },
    {
      name: "chromium:lxd-5.0-edge:unclustered",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "5.0-edge",
      },
    },
    {
      name: "firefox:lxd-5.0-edge:unclustered",
      use: {
        ...devices["Desktop Firefox"],
        lxdVersion: "5.0-edge",
      },
    },
    {
      name: "chromium:lxd-5.21-edge:unclustered",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "5.21-edge",
      },
      dependencies: ["login-chromium"],
    },
    {
      name: "firefox:lxd-5.21-edge:unclustered",
      use: {
        ...devices["Desktop Firefox"],
        lxdVersion: "5.21-edge",
      },
      dependencies: ["login-firefox"],
    },
    {
      name: "chromium:lxd-latest-edge:unclustered",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "latest-edge",
      },
      dependencies: ["login-chromium"],
    },
    {
      name: "firefox:lxd-latest-edge:unclustered",
      use: {
        ...devices["Desktop Firefox"],
        lxdVersion: "latest-edge",
      },
      dependencies: ["login-firefox"],
    },
    // Clustered tests
    {
      name: "chromium:lxd-5.0-edge:clustered",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "5.0-edge",
      },
      testMatch: "*-clustered.spec.ts",
      dependencies: ["enable-clustering-chrome"],
    },
    {
      name: "firefox:lxd-5.0-edge:clustered",
      use: {
        ...devices["Desktop Firefox"],
        lxdVersion: "5.0-edge",
      },
      dependencies: ["enable-clustering-firefox"],
      testMatch: "*-clustered.spec.ts",
    },
    {
      name: "chromium:lxd-5.21-edge:clustered",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "5.21-edge",
      },
      dependencies: ["enable-clustering-chrome"],
      testMatch: "*-clustered.spec.ts",
    },
    {
      name: "firefox:lxd-5.21-edge:clustered",
      use: {
        ...devices["Desktop Firefox"],
        lxdVersion: "5.21-edge",
      },
      dependencies: ["enable-clustering-firefox"],
      testMatch: "*-clustered.spec.ts",
    },
    {
      name: "chromium:lxd-latest-edge:clustered",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "latest-edge",
      },
      dependencies: ["enable-clustering-chrome"],
      testMatch: "*-clustered.spec.ts",
    },
    {
      name: "firefox:lxd-latest-edge:clustered",
      use: {
        ...devices["Desktop Firefox"],
        lxdVersion: "latest-edge",
      },
      dependencies: ["enable-clustering-firefox"],
      testMatch: "*-clustered.spec.ts",
    },
    {
      name: "coverage",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "latest-edge",
        hasCoverage: true,
      },
      dependencies: ["login-chromium"],
    },
    {
      name: "coverage:clustered",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "latest-edge",
        hasCoverage: true,
      },
      dependencies: ["enable-clustering-chrome"],
      testMatch: "*-clustered.spec.ts",
    },
    {
      name: "screenshots",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "latest-edge",
      },
      testMatch: "docs-screenshots.spec.ts",
    },
    {
      name: "screenshots-clustered",
      use: {
        ...devices["Desktop Chrome"],
        lxdVersion: "latest-edge",
      },
      dependencies: ["enable-clustering-chrome"],
      testMatch: "docs-screenshots-clustered.spec.ts",
    },
  ],
};

export default config;
