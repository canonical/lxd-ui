import type { Page } from "@playwright/test";
import type { LxdVersions } from "../fixtures/lxd-test";
import { expect } from "../fixtures/lxd-test";
import { randomNameSuffix } from "./name";
import { gotoURL } from "./navigate";

export const randomGroupName = (): string => {
  return `playwright-group-${randomNameSuffix()}`;
};

export const visitGroups = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Permissions" }).click();
  await page.getByRole("link", { name: "Groups", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Groups" }).locator("div"),
  ).toBeVisible();
};

export const renameGroup = async (
  page: Page,
  groupName: string,
  newGroupName: string,
) => {
  await visitGroups(page);
  await openEditGroupPanel(page, groupName);
  await page.getByPlaceholder("Enter name").fill(newGroupName);

  await page.getByRole("button", { name: "Save 1 change" }).click();
  await page.waitForSelector(
    `text=Group ${newGroupName ?? groupName} updated.`,
  );
};

export const openEditGroupPanel = async (page: Page, groupName: string) => {
  await page
    .getByRole("row", { name: `Select ${groupName} Name` })
    .getByTitle("Edit group")
    .click();
};

export const selectOption = async (
  page: Page,
  label: string,
  value: string,
) => {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.getByLabel("submenu").getByText(value, { exact: true }).click();
};

export const addPermission = async (
  page: Page,
  resourceType: string,
  resource: string,
  entitlement: string,
) => {
  await selectOption(page, "Resource Type", resourceType);
  if (resource !== "server") {
    await selectOption(page, "Resource", resource);
  }
  await selectOption(page, "Entitlement", entitlement);
  await page.getByRole("button", { name: "Add" }).click();
  const permissionRow = page
    .locator("tr")
    .filter({ hasText: `${resourceType}${resource}${entitlement}` });
  await expect(permissionRow).toBeVisible();
};

export const clickEditGroup = async (page: Page, lxdVersion: LxdVersions) => {
  const btnCaption =
    lxdVersion === "latest-edge" ? "Edit auth group" : "Edit group";
  await page.getByText(btnCaption).click();
};

export const removePermission = async (
  page: Page,
  resourceType: string,
  resource: string,
  entitlement: string,
) => {
  const permissionRow = page
    .locator("tr")
    .filter({ hasText: `${resourceType}${resource}${entitlement}` });
  await permissionRow
    .getByRole("button", { name: "Delete permission" })
    .click();
  const restoreButton = permissionRow.getByRole("button", {
    name: "Restore permission",
  });
  await expect(restoreButton).toBeVisible();
};

export const restorePermission = async (
  page: Page,
  resourceType: string,
  resource: string,
  entitlement: string,
) => {
  const permissionRow = page
    .locator("tr")
    .filter({ hasText: `${resourceType}${resource}${entitlement}` });
  await permissionRow
    .getByRole("button", { name: "Restore permission" })
    .click();
  const removeButton = permissionRow.getByRole("button", {
    name: "Delete permission",
  });
  await expect(removeButton).toBeVisible();
};

export const toggleIdentitiesForGroups = async (
  page: Page,
  identities: string[],
) => {
  for (const identity of identities) {
    await page
      .getByRole("rowheader", { name: `Select ${identity}` })
      .locator("label")
      .click();
    const rowModifiedIcon = page
      .getByRole("row", { name: `Select ${identity} Identity` })
      .locator("i");
    await expect(rowModifiedIcon).toBeVisible();
  }
};

export const selectGroupsToModify = async (page: Page, groups: string[]) => {
  for (const group of groups) {
    await page
      .getByRole("rowheader", { name: `Select ${group}` })
      .locator("span")
      .click();
  }
};

export const createGroup = async (
  page: Page,
  groupName: string,
  description: string,
  withPermissions = false,
) => {
  await visitGroups(page);
  await page.getByRole("button", { name: "Create group" }).click();
  await page.getByPlaceholder("Enter name").fill(groupName);
  await page.getByPlaceholder("Enter description").click();
  await page.getByPlaceholder("Enter description").fill(description);

  if (withPermissions) {
    await page.getByRole("button", { name: "Add permissions" }).click();
    await addPermission(page, "Server", "server", "admin");
  }

  await page
    .locator("#panel-footer")
    .getByRole("button", { name: "Create group" })
    .click();
  await page.waitForSelector(`text=Group ${groupName} created`);
};

export const deleteGroup = async (page: Page, groupName: string) => {
  await visitGroups(page);
  await page
    .getByRole("row", { name: `Select ${groupName}` })
    .getByTitle("Delete group")
    .click();
  await page
    .getByPlaceholder("confirm-delete-group")
    .fill("confirm-delete-group");
  await page
    .getByRole("button", { name: "Permanently delete 1 group" })
    .click();
  await page.waitForSelector(`text=Group ${groupName} deleted.`);
};

export const assertGroupPermissionsCount = async (
  page: Page,
  groupName: string,
  count: number,
) => {
  const groupRow = page.getByRole("row", { name: groupName });
  const permissionCount = groupRow.getByLabel("Permissions for this group");
  await expect(permissionCount).toContainText(`${count}`);
};
