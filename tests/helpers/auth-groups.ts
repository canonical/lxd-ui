import { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";
import { randomNameSuffix } from "./name";

export const randomGroupName = (): string => {
  return `playwright-group-${randomNameSuffix()}`;
};

export const visitGroupsPage = async (page: Page) => {
  await page.goto("/ui/");
  await page.getByRole("button", { name: "Permissions" }).click();
  await page.getByRole("link", { name: "Groups", exact: true }).click();
  await expect(
    page
      .getByRole("heading", { name: "Groups Learn more about" })
      .locator("div"),
  ).toBeVisible();
};

export const selectGroupAction = async (
  page: Page,
  groupName: string,
  action:
    | "Edit group"
    | "Manage identities"
    | "Manage permissions"
    | "Delete group",
) => {
  await page
    .getByRole("row", { name: `Select ${groupName} Name` })
    .getByLabel("group actions menu")
    .click();
  await page.getByRole("button", { name: action }).first().click();
};

export const editGroup = async (
  page: Page,
  groupName: string,
  newGroupName?: string,
  description?: string,
) => {
  await visitGroupsPage(page);
  await selectGroupAction(page, groupName, "Edit group");

  if (newGroupName) {
    await page.getByPlaceholder("Enter name").fill(newGroupName);
  }

  if (description) {
    await page.getByPlaceholder("Enter description").click();
    await page.getByPlaceholder("Enter description").fill(description);
  }

  await page.getByRole("button", { name: "Confirm" }).click();
  await page.waitForSelector(
    `text=Group ${newGroupName ?? groupName} updated.`,
  );
};

export const addPermission = async (
  page: Page,
  resourceType: string,
  resource: string,
  entitlement: string,
) => {
  await page
    .getByLabel("Add permissions")
    .getByLabel("Resource type")
    .selectOption(resourceType);
  if (resource !== "server") {
    await page
      .getByLabel("Add permissions")
      .getByLabel("Resource", { exact: true })
      .selectOption(resource);
  }
  await page
    .getByLabel("Add permissions")
    .getByLabel("Entitlement")
    .selectOption(entitlement);
  await page.getByRole("button", { name: "Add" }).click();
  const permissionRow = page
    .locator("tr")
    .filter({ hasText: `${resourceType}${resource}${entitlement}` });
  await expect(permissionRow).toBeVisible();
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

export const toggleIdentities = async (page: Page, identities: string[]) => {
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

export const selectGroups = async (page: Page, groups: string[]) => {
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
) => {
  await visitGroupsPage(page);
  await page.getByRole("button", { name: "Create group" }).click();
  await page.getByPlaceholder("Enter name").fill(groupName);
  await page.getByPlaceholder("Enter description").click();
  await page.getByPlaceholder("Enter description").fill(description);
  await page
    .getByLabel("Side panel")
    .getByRole("button", { name: "Create group" })
    .click();
  await page.waitForSelector(`text=Group ${groupName} created`);
};

export const deleteGroup = async (page: Page, groupName: string) => {
  await visitGroupsPage(page);
  await selectGroupAction(page, groupName, "Delete group");
  await page
    .getByPlaceholder("confirm-delete-group")
    .fill("confirm-delete-group");
  await page
    .getByRole("button", { name: "Permanently delete 1 group" })
    .click();
  await page.waitForSelector(`text=Group ${groupName} deleted.`);
};
