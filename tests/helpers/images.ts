import { expect } from "../fixtures/lxd-test";
import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import { dismissNotification } from "./notification";

export const visitLocalImages = async (page: Page, project: string) => {
  await gotoURL(page, `/ui/project/${project}/local-images`);
  await expect(page.getByText("Import image")).toBeVisible();
};

export const deleteAllImages = async (page: Page, project = "default") => {
  await visitLocalImages(page, project);
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

export const deleteImage = async (page: Page, imageIdentifier: string) => {
  await visitLocalImages(page, "default");

  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(imageIdentifier);

  const imageRow = page.locator(`tr:has-text("${imageIdentifier}")`);
  const imageName = await imageRow.locator("td").nth(1).innerText();

  await page.getByRole("button", { name: "Delete" }).first().click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();

  await dismissNotification(page, `Image ${imageName} deleted.`);
};
