import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";

export const ISO_FILE = "./tests/fixtures/foo.iso";

export const createCustomISO = async (page: Page, isoName: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Storage", exact: true }).click();
  await page.getByRole("link", { name: "Custom ISOs" }).click();
  await page.getByRole("button", { name: "Upload custom ISO" }).click();
  await page.getByLabel("Local file").setInputFiles(ISO_FILE);
  await page.getByLabel("Alias").fill(isoName);
  await page.getByRole("button", { name: "Upload", exact: true }).click();
  await page.getByText(`Custom ISO ${isoName} uploaded successfully`).waitFor();
};

export const deleteCustomISO = async (page: Page, isoName: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Storage", exact: true }).click();
  await page.getByRole("link", { name: "Custom ISOs" }).click();
  await page.getByPlaceholder("Search for custom ISOs").fill(isoName);
  const isoRow = page.getByRole("row").filter({ hasText: isoName });
  await isoRow.waitFor();
  await isoRow.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.getByText(`Custom ISO ${isoName} deleted.`).waitFor();
};
