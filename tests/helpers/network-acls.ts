import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { gotoURL } from "./navigate";
import { expect } from "../fixtures/lxd-test";

export const randomNetworkAclName = (): string => {
  return `test-${randomNameSuffix()}`;
};

export const createNetworkAcl = async (page: Page, networkAcl: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Networking" }).click();
  await page.getByRole("link", { name: "ACLs", exact: true }).click();
  await page.getByRole("button", { name: "Create ACL" }).click();
  await page.getByRole("heading", { name: "Create a network ACL" }).click();

  await page.getByLabel("Name", { exact: true }).fill(networkAcl);
  await page.getByLabel("Description", { exact: true }).fill("desc-value");

  await page.getByRole("button", { name: "Add ingress rule" }).click();
  await page.getByLabel("Source", { exact: true }).fill("1.2.3.4");
  await page.getByLabel("Source port", { exact: true }).fill("23");
  await page.getByLabel("Destination", { exact: true }).fill("5.6.7.8");
  await page.getByLabel("Destination port", { exact: true }).fill("42");
  await page.getByRole("button", { name: "Add rule", exact: true }).click();

  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Network ACL ${networkAcl} created.`);
};

export const editNetworkAcl = async (page: Page, networkAcl: string) => {
  await visitNetworkAcl(page, networkAcl);
  await expect(page.getByText("desc-value")).toBeVisible();
  await expect(page.getByText("1.2.3.4:23")).toBeVisible();
  await expect(page.getByText("5.6.7.8:42")).toBeVisible();

  await page.getByLabel("Description").first().fill("");
  await page.getByRole("button", { name: "Remove rule", exact: true }).click();

  await page.getByRole("button", { name: "Save 2 changes" }).click();
  await page.waitForSelector(`text=Network ACL ${networkAcl} updated.`);

  await expect(page.getByText("desc-value")).not.toBeVisible();
  await expect(page.getByText("1.2.3.4:23")).not.toBeVisible();
  await expect(page.getByText("5.6.7.8:42")).not.toBeVisible();
};

export const renameNetworkAcl = async (
  page: Page,
  oldName: string,
  newName: string,
) => {
  await visitNetworkAcl(page, oldName);
  await page.locator("li", { hasText: oldName }).click();
  await page.getByRole("textbox").first().fill(newName);
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForSelector(
    `text=Network ACL ${oldName} renamed to ${newName}.`,
  );
};

export const deleteNetworkAcl = async (page: Page, networkAcl: string) => {
  await visitNetworkAcl(page, networkAcl);
  await page.getByRole("button", { name: "Delete ACL" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();

  await page.waitForSelector(`text=Network ACL ${networkAcl} deleted.`);
};

export const visitNetworkAcl = async (page: Page, networkAcl: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Networking" }).click();
  await page.getByRole("link", { name: "ACLs", exact: true }).click();
  await page.getByRole("link", { name: networkAcl }).first().click();

  await expect(
    page.getByText("Click the ACL name in the header to rename the ACL"),
  ).toBeVisible();
};
