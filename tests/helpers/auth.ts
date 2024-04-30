import { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";

export const assertModificationStatus = async (
  page: Page,
  statusText: string,
) => {
  const status = page.getByText(statusText);
  await expect(status).toBeVisible();
};

export const undoChange = async (page: Page) => {
  await page.locator("body").press("Control+Z");
};

export const redoChange = async (page: Page) => {
  await page.locator("body").press("Control+Shift+Z");
};

export const confirmIdentitiesModifiedForGroup = async (
  page: Page,
  groupName: string,
  identities: string[],
  action: "added" | "removed",
) => {
  const groupRow = page.locator("tr").filter({ hasText: groupName });
  const symbol = action === "added" ? "+" : "-";
  for (const identity of identities) {
    await expect(groupRow.getByText(`${symbol} ${identity}`)).toBeVisible();
  }
};

export const confirmGroupsModifiedForIdentity = async (
  page: Page,
  identity: string,
  groups: string[],
  action: "added" | "removed",
) => {
  const identityRow = page.locator("tr").filter({ hasText: identity });
  const symbol = action === "added" ? "+" : "-";
  for (const group of groups) {
    await expect(identityRow.getByText(`${symbol} ${group}`)).toBeVisible();
  }
};
