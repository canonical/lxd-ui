import type { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";
import { pluralize } from "util/instanceBulkActions";
import { randomNameSuffix } from "./name";
import { gotoURL } from "./navigate";

export const randomIdpGroupName = (): string => {
  return `playwright-idp-group-${randomNameSuffix()}`;
};

export const visitIdpGroups = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Permissions" }).click();
  await page.getByRole("link", { name: "IDP groups" }).click();
  await expect(
    page.getByRole("link", { name: "Learn more about IDP groups" }),
  ).toBeVisible();
};

export const createIdpGroup = async (
  page: Page,
  idpGroup: string,
  groups: string[],
) => {
  await visitIdpGroups(page);
  await page.getByRole("button", { name: "Create IDP group" }).click();
  await page.getByPlaceholder("Enter name").fill(idpGroup);
  for (const group of groups) {
    await page
      .getByRole("rowheader", { name: `Select ${group}` })
      .locator("span")
      .click();
  }
  await page.getByRole("button", { name: "Confirm" }).click();
  await page.waitForSelector(`text=IDP group ${idpGroup} created`);
};

export const deleteIdpGroup = async (page: Page, idpGroup: string) => {
  await page
    .getByRole("row", { name: `Select ${idpGroup}` })
    .getByLabel("Delete IDP group")
    .click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.waitForSelector(`text=IDP group ${idpGroup} deleted.`);
};

export const editIdpGroup = async (
  page: Page,
  oldIdpGroupName: string,
  newIdpGroupName: string,
  groups: string[],
) => {
  await visitIdpGroups(page);
  await page
    .getByRole("row", { name: `Select ${oldIdpGroupName} Name Number of` })
    .getByLabel("Edit IDP group details")
    .click();
  await page.getByPlaceholder("Enter name").fill(newIdpGroupName);
  for (const group of groups) {
    await page
      .getByRole("rowheader", { name: `Select ${group}` })
      .locator("span")
      .click();
  }
  await expect(
    page.getByText(
      `${groups.length} ${pluralize("group", groups.length)} will be modified`,
    ),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: `Apply ${groups.length} group ${pluralize("change", groups.length)}`,
    })
    .click();
  await page.waitForSelector(`text=IDP group ${newIdpGroupName} updated.`);
};
