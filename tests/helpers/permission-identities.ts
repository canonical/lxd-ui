import type { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";
import { gotoURL } from "./navigate";
import { randomNameSuffix } from "./name";
import { dismissNotification } from "./notification";
import type { IdentityType } from "util/identityTypes";

// These identities are created by the setup_test script in tests/scripts
export const identityBar = "bar@bar.com";
export const identityFoo = "foo@foo.com";

export const randomIdentityName = (): string => {
  return `playwright-identity-${randomNameSuffix()}`;
};

export const visitIdentities = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Permissions" }).click();
  await page.getByRole("link", { name: "Identities" }).click();
  await expect(
    page.getByRole("heading", { name: "Identities" }).locator("div"),
  ).toBeVisible();
};

export const toggleGroupsForIdentities = async (
  page: Page,
  groups: string[],
) => {
  for (const group of groups) {
    await page
      .getByRole("cell", { name: `Select ${group}` })
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
      .getByRole("cell", { name: `Select ${identity}` })
      .locator("span")
      .click();
  }
};

export const getDisplayedToken = async (page: Page): Promise<string> => {
  const token = page.locator(".command-wrapper .command").first();
  await expect(token).toBeVisible();
  const fullToken = await token.getAttribute("title");
  expect(fullToken).toBeTruthy();
  return fullToken ?? "";
};

export const closeTokenDisplayModal = async (page: Page) => {
  const tokenModal = page.getByRole("dialog");
  const copiedConfirmation = tokenModal.getByText("I have copied the token");

  await expect(copiedConfirmation).toBeVisible();
  await copiedConfirmation.click();
  await tokenModal.getByRole("button", { name: "Done" }).click();
};

export const issueTokenFromEditPanel = async (
  page: Page,
  expiry?: string,
): Promise<string> => {
  await page.getByRole("button", { name: "Issue new token" }).click();
  const tokenModal = page
    .locator(".p-modal")
    .filter({ hasText: "Issue new token" });

  if (expiry) {
    await tokenModal.getByLabel("Custom").click();
    await tokenModal.getByLabel("Token expiry value").fill(expiry);
  }

  await tokenModal.getByRole("button", { name: "Issue new token" }).click();
  await expect(page.getByText("token issued successfully")).toBeVisible();

  return getDisplayedToken(page);
};

export const createIdentity = async (
  page: Page,
  name: string,
  identityType: IdentityType,
  expiry?: string,
) => {
  await visitIdentities(page);
  await page.getByRole("button", { name: "Create identity" }).click();
  await page.getByRole("button", { name: identityType }).click();

  const sidePanel = page.getByLabel("Side panel");
  await sidePanel.getByRole("textbox", { name: "Name" }).fill(name);
  if (expiry) {
    await sidePanel.getByLabel("Custom").click({ force: true });
    await sidePanel.getByLabel("Token expiry value").fill(expiry);
  }
  await sidePanel.getByRole("button", { name: "Create identity" }).click();

  const modal = page.getByRole("dialog");
  await expect(modal).toContainText(`Identity ${name} created successfully`);

  await modal
    .getByRole("checkbox", { name: "I have copied the token" })
    .check({ force: true });
  await modal.getByRole("button", { name: "Done" }).click();

  const identityRow = page.getByRole("row").filter({ hasText: name });
  await expect(identityRow).toBeVisible();
  await expect(identityRow).toContainText(identityType);
};

export const deleteIdentity = async (page: Page, name: string) => {
  await visitIdentities(page);
  const row = page.getByRole("row").filter({ hasText: name });

  const identityType = (
    await row.getByRole("cell", { name: "Type", exact: true }).textContent()
  )?.trim();
  const identityId = (
    await row.getByRole("cell", { name: "ID", exact: true }).textContent()
  )?.trim();

  expect(identityType).toBeTruthy();
  expect(identityId).toBeTruthy();

  await row.getByRole("button", { name: "Delete identity" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await dismissNotification(
    page,
    `Identity ${name} (${identityType}, ${identityId}) deleted.`,
  );
  await expect(row).not.toBeVisible();
};
