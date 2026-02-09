import type { Page } from "@playwright/test";
import { visitProfile } from "./profile";

export const attachVolume = async (
  page: Page,
  volume: string,
  path: string,
) => {
  await page.getByRole("button", { name: "Attach disk device" }).click();
  await page.getByRole("button", { name: "Attach custom volume" }).click();
  await page.getByRole("button", { name: "Create volume" }).click();
  await page.getByPlaceholder("Enter name").fill(volume);
  await page.getByRole("button", { name: "Create volume" }).click();
  await page.getByTitle(`Select ${volume}`, { exact: true }).click();
  await page.getByPlaceholder("Enter full path (e.g. /data)").last().fill(path);
};

export const attachHostPath = async (
  page: Page,
  source: string,
  path: string,
) => {
  await page.getByRole("button", { name: "Attach disk device" }).click();
  await page.getByRole("button", { name: "Mount host path" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Choose disk type / Mount host",
  });
  await dialog.getByLabel("Host path", { exact: true }).fill(source);
  await dialog.getByLabel("Mount point", { exact: true }).fill(path);
  await dialog.getByRole("button", { name: "Attach", exact: true }).click();
};

export const detachDiskDevice = async (page: Page, volumeDevice: string) => {
  await page
    .getByRole("row", { name: volumeDevice })
    .getByTitle("Detach")
    .click();
  await page
    .getByLabel("Confirm disk detachment")
    .getByRole("button", { name: "Detach" })
    .click();
};

export const visitProfileGPUDevices = async (page: Page, profile: string) => {
  await visitProfile(page, profile);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("GPU", { exact: true }).click();
};

export const visitProfileOtherDevices = async (page: Page, profile: string) => {
  await visitProfile(page, profile);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Other", { exact: true }).click();
};
