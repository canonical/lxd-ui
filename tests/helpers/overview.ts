import type { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";
import { gotoURL } from "./navigate";

const OVERVIEW_FEATURE_FLAG = "lxdui_ff_OVERVIEW";

export const OVERVIEW_NARROW_VIEWPORT = { width: 400, height: 800 };

export const enableOverviewFeatureFlag = async (page: Page): Promise<void> => {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, "true");
  }, OVERVIEW_FEATURE_FLAG);
};

export const visitOverview = async (
  page: Page,
  project = "default",
): Promise<void> => {
  await enableOverviewFeatureFlag(page);
  await gotoURL(page, `/ui/project/${encodeURIComponent(project)}/overview`);
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("link", { name: "Project instances list" }),
  ).toBeVisible();
};

export const visitAllProjectsOverview = async (page: Page): Promise<void> => {
  await enableOverviewFeatureFlag(page);
  await gotoURL(page, "/ui/all-projects/overview");
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("link", { name: "All instances list" }),
  ).toBeVisible();
};
