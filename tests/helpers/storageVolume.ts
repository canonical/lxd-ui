import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { expect } from "../fixtures/lxd-test";
import { gotoURL } from "./navigate";
import { isServerClustered } from "./cluster";
import { searchEntityListPage } from "./search";

export const randomVolumeName = (): string => {
  return `playwright-volume-${randomNameSuffix()}`;
};

export const randomIsoName = (): string => {
  return `playwright-iso-${randomNameSuffix()}`;
};

export const createVolume = async (
  page: Page,
  volume: string,
  volumeType = "filesystem",
) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Storage" }).click();
  await page.getByRole("link", { name: "Volumes" }).click();
  await page.getByRole("button", { name: "Create volume" }).click();
  await expect(page.getByLabel("Storage pool", { exact: true })).toBeVisible();
  await page.getByPlaceholder("Enter name").fill(volume);
  await page.getByPlaceholder("Enter value").fill("1");
  await page
    .getByPlaceholder("Enter content type")
    .selectOption({ label: volumeType });
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByText(`Storage volume ${volume} created.`).waitFor();
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const deleteVolume = async (
  page: Page,
  volume: string,
  project?: string,
) => {
  await visitVolume(page, volume, project);
  await page.getByRole("button", { name: "Delete" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm delete" });
  await dialog.getByRole("button", { name: "Delete" }).click();
  await expect(
    page.getByText(`Storage volume ${volume} deleted.`),
  ).toBeVisible();
};

export const visitVolume = async (
  page: Page,
  volume: string,
  project?: string,
) => {
  const url = project ? `/ui/project/${project}` : "/ui/";
  await gotoURL(page, url);
  await page.getByRole("button", { name: "Storage" }).click();
  await page.getByRole("link", { name: "Volumes" }).click();
  await expect(page.getByText("Create volume")).toBeVisible();
  await searchEntityListPage(page, volume);
  await page.getByRole("link", { name: volume }).first().click();
  await expect(page.getByText(`Storage volumes${volume}`)).toBeVisible();
};

export const editVolume = async (page: Page, volume: string) => {
  await visitVolume(page, volume);
  await page.getByTestId("tab-link-Configuration").click();
};

export const saveVolume = async (page: Page, volume: string) => {
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await page.waitForSelector(`text=Storage volume ${volume} updated.`);
};

export const migrateVolumePool = async (
  page: Page,
  volume: string,
  targetPool: string,
) => {
  const serverClustered = await isServerClustered(page);
  await visitVolume(page, volume);
  await page.getByRole("button", { name: "Migrate", exact: true }).click();
  await page
    .getByRole("button", { name: "Move volume to a different storage pool" })
    .click();
  await page
    .getByRole("dialog")
    .locator("tr")
    .filter({ hasText: targetPool })
    .getByRole("button")
    .click();
  await page
    .locator("#migrate-volume-actions")
    .getByRole("button", { name: "Migrate", exact: true })
    .click();

  await page.waitForSelector(
    `text=successfully migrated to pool ${targetPool}`,
  );

  await expect(page).toHaveURL(
    `/ui/project/default/storage/pool/${targetPool}${serverClustered ? "/member/local" : "/volumes/custom"}/${volume}`,
  );
};

export const copyStorageVolume = async (
  page: Page,
  volume: string,
  targetPool?: string,
  targetProject?: string,
) => {
  const newVolumeName = randomVolumeName();
  await visitVolume(page, volume);
  await page.getByLabel("Copy volume").click();

  // ensure storage pools finished loading
  await expect(page.getByLabel("Storage pool", { exact: true })).toBeVisible();

  await page.getByLabel("New volume name").click();
  await page.getByLabel("New volume name").fill(newVolumeName);
  if (targetPool) {
    await page.getByLabel("Storage pool", { exact: true }).click();
    await page.getByText(targetPool).click();
  }
  if (targetProject) {
    await page.getByLabel("Target project").selectOption(targetProject);
  }
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await page.waitForSelector(`text=Created volume ${newVolumeName}.`);
  return newVolumeName;
};
