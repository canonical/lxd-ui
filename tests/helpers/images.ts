import { expect } from "../fixtures/lxd-test";
import { Page } from "@playwright/test";

export const deleteAllImages = async (
  page: Page,
  project: string = "default",
) => {
  await page.goto(`/ui/project/${project}`);
  await page.getByRole("link", { name: "Images", exact: true }).first().click();
  await page
    .getByRole("columnheader", { name: "select" })
    .locator("label:has-text('Select all')")
    .click();
  await page.getByRole("button", { name: "Delete image" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();

  const notification = page.locator(".toast-notification");
  await expect(notification).toHaveText(/.*deleted.*/);
};
