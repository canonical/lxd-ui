import { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";

export const randomVolumeName = (): string => {
  return `playwright-volume-${randomNameSuffix()}`;
};

export const createVolume = async (page: Page, volume: string) => {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Storage" }).click();
  await page.getByTestId("tab-link-Volumes").click();
  await page.getByRole("button", { name: "Create volume" }).click();
  await page.getByPlaceholder("Enter name").fill(volume);
  await page.getByPlaceholder("Enter value").fill("1");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Storage volume ${volume} created.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const deleteVolume = async (page: Page, volume: string) => {
  await visitVolume(page, volume);
  await page.getByRole("button", { name: "Delete volume" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Storage volume ${volume} deleted.`);
};

export const visitVolume = async (page: Page, volume: string) => {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Storage" }).click();
  await page.getByTestId("tab-link-Volumes").click();
  await page.getByPlaceholder("Search and filter").fill(volume);
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");
  await page.getByRole("link", { name: volume }).first().click();
};

export const editVolume = async (page: Page, volume: string) => {
  await visitVolume(page, volume);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByRole("button", { name: "Edit volume" }).click();
};

export const saveVolume = async (page: Page, volume: string) => {
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForSelector(`text=Storage volume ${volume} updated.`);
};
