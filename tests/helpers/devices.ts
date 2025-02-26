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
  await page.getByLabel("Host path", { exact: true }).click();
  await page.getByLabel("Host path", { exact: true }).fill(source);
  const hostPathModal = page.getByLabel("Choose disk type /");
  await hostPathModal.getByLabel("Mount point").click();
  await hostPathModal.getByLabel("Mount point").fill(path);
  await page.getByRole("button", { name: "Attach", exact: true }).click();
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
