import { test as base } from "@playwright/test";
import { finishCoverage, startCoverage } from "./coverage";

export type LxdVersions = "5.0-stable" | "latest-edge";
export type TestOptions = {
  lxdVersion: LxdVersions;
  hasCoverage: boolean;
};

export const test = base.extend<TestOptions>({
  lxdVersion: ["latest-edge", { option: true }],
  hasCoverage: [false, { option: true }],
});

test.beforeEach(async ({ page, hasCoverage }) => {
  await startCoverage(page, hasCoverage);
});

test.afterEach(async ({ page, hasCoverage }) => {
  await finishCoverage(page, hasCoverage);
});

export const expect = test.expect;
