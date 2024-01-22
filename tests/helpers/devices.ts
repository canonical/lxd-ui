import { Page } from "@playwright/test";

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
    .getByRole("row", { name: volumeDevice })
    .getByTitle("Detach")
    .click();
  await page
    .getByLabel("Confirm volume detach")
    .getByRole("button", { name: "Detach" })
    .click();
};
