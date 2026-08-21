import { test as base, type Page } from "@playwright/test";
import { finishCoverage, startCoverage } from "./coverage";

export type LxdVersions = "latest-stable" | "latest-edge";
export interface TestOptions {
  lxdVersion: LxdVersions;
  hasCoverage: boolean;
  runCoverage: Page;
}

export const test = base.extend<TestOptions>({
  lxdVersion: ["latest-edge", { option: true }],
  hasCoverage: [false, { option: true }],
  runCoverage: [
    async ({ page, hasCoverage }, use) => {
      if (hasCoverage) {
        await startCoverage(page);
        await use(page);
        await finishCoverage(page);
      } else {
        await use(page);
      }
    },
    { auto: true },
  ],
});

export const expect = test.expect;
