import { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { expect } from "../fixtures/lxd-test";
import { gotoURL } from "./navigate";

export const randomVolumeName = (): string => {
  return `playwright-volume-${randomNameSuffix()}`;
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
  await page.getByPlaceholder("Enter name").fill(volume);
  await page.getByPlaceholder("Enter value").fill("1");
  await page
    .getByPlaceholder("Enter content type")
    .selectOption({ label: volumeType });
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Storage volume ${volume} created.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const deleteVolume = async (
  page: Page,
  volume: string,
  project?: string,
) => {
  await visitVolume(page, volume, project);
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Storage volume ${volume} deleted.`);
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
  await page.getByPlaceholder("Search and filter").fill(volume);
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");
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

export const migrateVolume = async (
  page: Page,
  volume: string,
  targetPool: string,
) => {
  await visitVolume(page, volume);
  await page.getByRole("button", { name: "Migrate", exact: true }).click();
  await page
    .getByRole("dialog", { name: `Choose storage pool for volume ${volume}` })
    .locator("tr")
    .filter({ hasText: targetPool })
    .getByRole("button")
    .click();
  await page
    .getByLabel("Confirm migration")
    .getByRole("button", { name: "Migrate", exact: true })
    .click();

  await page.waitForSelector(
    `text=successfully migrated to pool ${targetPool}`,
  );

  await expect(page).toHaveURL(
    `/ui/project/default/storage/pool/${targetPool}/volumes/custom/${volume}`,
  );
};

export const duplicateStorageVolume = async (
  page: Page,
  volume: string,
  targetPool?: string,
  targetProject?: string,
) => {
  const newVolumeName = randomVolumeName();
  await visitVolume(page, volume);
  await page.getByLabel("Duplicate volume").click();
  await page.getByLabel("New volume name").click();
  await page.getByLabel("New volume name").fill(newVolumeName);
  if (targetPool) {
    await page.getByLabel("Storage pool", { exact: true }).click();
    await page.getByText(targetPool).click();
  }
  if (targetProject) {
    await page.getByLabel("Target project").selectOption(targetProject);
  }
  await page.getByRole("button", { name: "Duplicate", exact: true }).click();
  await page.waitForSelector(`text=Duplication of volume ${volume} started.`);
  await page.waitForSelector(`text=Created volume ${newVolumeName}.`);
  return newVolumeName;
};
