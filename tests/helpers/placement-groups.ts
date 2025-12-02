import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { gotoURL } from "./navigate";
import type { LxdVersions } from "../fixtures/lxd-test";
import { expect, test } from "../fixtures/lxd-test";

export const skipIfNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge",
    "Placement groups are not available in LXD prior to 6.6",
  );
};

export const randomPlacementGroupName = (): string => {
  return `playwright-placement-group-${randomNameSuffix()}`;
};

export const createPlacementGroup = async (
  page: Page,
  placementGroup: string,
) => {
  await visitPlacementGroups(page);
  await page.getByRole("button", { name: "Create placement group" }).click();
  await page.getByPlaceholder("Enter name").fill(placementGroup);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Placement group ${placementGroup} created.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const deletePlacementGroup = async (
  page: Page,
  placementGroup: string,
) => {
  await visitPlacementGroups(page);
  await page
    .locator("tr")
    .filter({ hasText: placementGroup })
    .getByTitle("Delete placement group")
    .click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Placement group ${placementGroup} deleted.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const editPlacementGroup = async (
  page: Page,
  placementGroup: string,
) => {
  await visitPlacementGroups(page);
  await page
    .locator("tr")
    .filter({ hasText: placementGroup })
    .getByTitle("Edit placement group")
    .click();
  await page
    .getByPlaceholder("Enter description")
    .fill(placementGroup + " description");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.waitForSelector(`text=Placement group ${placementGroup} updated.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const visitPlacementGroups = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Placement" }).click();
  await expect(
    page.getByRole("heading", { name: "Placement groups" }).locator("div"),
  ).toBeVisible();
};
