import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { gotoURL } from "./navigate";
import { expect } from "../fixtures/lxd-test";
import { dismissNotification } from "./notification";

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
  await dismissNotification(page, `Placement group ${placementGroup} created.`);
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
  await dismissNotification(page, `Placement group ${placementGroup} deleted.`);
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
  await dismissNotification(page, `Placement group ${placementGroup} updated.`);
};

export const visitPlacementGroups = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Placement" }).click();
  await expect(
    page.getByRole("heading", { name: "Placement groups" }),
  ).toBeVisible();
};
