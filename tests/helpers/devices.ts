import { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";

export const randomVolumeName = (): string => {
  return `playwright-volume-${randomNameSuffix()}`;
};

export const attachVolume = async (
  page: Page,
  volume: string,
  path: string,
) => {
  await page.getByRole("button", { name: "Attach disk device" }).click();
  await page.getByRole("button", { name: "Create volume" }).click();
  await page.getByPlaceholder("Enter name").fill(volume);
  await page.getByRole("button", { name: "Create volume" }).click();
  await page.getByLabel(`Select ${volume}`, { exact: true }).click();
  await page.getByPlaceholder("Enter full path (e.g. /data)").last().fill(path);
};

export const detachVolume = async (page: Page, volumeDevice: string) => {
  await page
    .getByRole("row", { name: `${volumeDevice} Detach` })
    .getByTitle("Detach")
    .click();
  await page
    .getByLabel("Confirm volume detach")
    .getByRole("button", { name: "Detach" })
    .click();
};

export const deleteVolume = async (page: Page, volume: string) => {
  await page.getByRole("link", { name: "Storage" }).click();
  await page.getByTestId("tab-link-Volumes").click();
  await page.getByPlaceholder("Search and filter").fill(volume);
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");
  await page.getByRole("row").nth(1).getByTitle("Delete").click();
  await page
    .getByLabel("Confirm delete")
    .getByRole("button", { name: "Delete" })
    .click();
};
