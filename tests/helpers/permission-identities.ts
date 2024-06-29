import { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";

// These identities are created by the setup_test script in tests/scripts
export const identityBar = "bar@bar.com";
export const identityFoo = "foo@foo.com";

export const visitIdentitiesPage = async (page: Page) => {
  await page.goto("/ui/");
  await page.getByRole("button", { name: "Permissions" }).click();
  await page.getByRole("link", { name: "Identities" }).click();
  await expect(
    page
      .getByRole("heading", { name: "Identities Learn more about" })
      .locator("div"),
  ).toBeVisible();
};

export const toggleGroupsForIdentities = async (
  page: Page,
  groups: string[],
) => {
  for (const group of groups) {
    await page
      .getByRole("rowheader", { name: `Select ${group}` })
      .locator("label")
      .click();
    const rowModifiedIcon = page
      .getByRole("row", { name: `Select ${group}` })
      .locator("i");
    await expect(rowModifiedIcon).toBeVisible();
  }
};

export const selectIdentitiesToModify = async (
  page: Page,
  identities: string[],
) => {
  for (const identity of identities) {
    await page
      .getByRole("rowheader", { name: `Select ${identity}` })
      .locator("span")
      .click();
  }
};
