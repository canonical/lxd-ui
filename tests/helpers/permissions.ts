import type { LxdVersions } from "../fixtures/lxd-test";
import { test, expect } from "../fixtures/lxd-test";
import type { Page } from "@playwright/test";

export const skipIfNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "Fine grained authorisation is not available for lxd 5.0",
  );
};

export const assertTextVisible = async (
  page: Page,
  textValue: string,
  exact = false,
) => {
  const textLocator = page.getByText(textValue, { exact: exact });
  await expect(textLocator).toBeVisible();
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
