import { Page, test as base } from "@playwright/test";
import { finishCoverage, startCoverage } from "./coverage";

export type LxdVersions = "5.0-stable" | "latest-edge";
export type TestOptions = {
  lxdVersion: LxdVersions;
  hasCoverage: boolean;
  runCoverage: Page;
};

export const test = base.extend<TestOptions>({
  lxdVersion: ["latest-edge", { option: true }],
  hasCoverage: [false, { option: true }],
  runCoverage: [
    async ({ page, hasCoverage }, use) => {
      await startCoverage(page, hasCoverage);
      await use(page);
      await finishCoverage(page, hasCoverage);
    },
    { auto: true },
  ],
});

export const expect = test.expect;
