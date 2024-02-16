import { test as base } from "@playwright/test";

export type LxdVersions = "5.0-stable" | "latest-edge";
export type TestOptions = {
  lxdVersion: LxdVersions;
};

export const test = base.extend<TestOptions>({
  lxdVersion: ["latest-edge", { option: true }],
});
