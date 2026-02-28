import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { gotoURL } from "./navigate";
import { expect } from "../fixtures/lxd-test";
import { visitImages } from "./images";
import { searchEntityListPage } from "./search";

const DEFAULT_IMAGE = "alpine/3.23/cloud";

export const randomInstanceName = (): string => {
  return `playwright-instance-${randomNameSuffix()}`;
};

export const randomImageName = (): string => {
  return `playwright-image-${randomNameSuffix()}`;
};

export const selectAllInstances = async (page: Page) => {
  await page.getByLabel("multiselect rows").first().click();
  await page.getByRole("menuitem", { name: "Select all instances" }).click();
};

export const createInstance = async (
  page: Page,
  instance: string,
  type = "container",
  project = "default",
  image = DEFAULT_IMAGE,
) => {
  await gotoURL(page, `/ui/project/${project}`);
  await page.waitForLoadState("networkidle");
  await page
    .getByRole("link", { name: "Instances", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByLabel("Instance name").click();
  await page.getByLabel("Instance name").fill(instance);
  await page.getByRole("button", { name: "Browse images" }).click();
  await page.getByPlaceholder("Search an image").click();
  await page.getByPlaceholder("Search an image").fill(image);
  await page
    .getByRole("row")
    .filter({ hasNotText: "cached" })
    .getByRole("button", { name: "Select" })
    .first()
    .click();
  await page
    .getByRole("combobox", { name: "Instance type" })
    .selectOption(type);

  if (project !== "default") {
    await page.getByText("Disk", { exact: true }).click();
    await page.getByRole("button", { name: "Edit" }).click();
  }

  await page.getByRole("button", { name: "Create" }).first().click();

  await page.getByText(`Created instance ${instance}.`).waitFor();
};

export const visitInstance = async (
  page: Page,
  instance: string,
  project = "default",
) => {
  await gotoURL(page, `/ui/project/${project}`);
  await searchEntityListPage(page, instance);
  await page.getByRole("link", { name: instance }).first().click();
  await expect(page.getByText(`Instances${instance}`)).toBeVisible();
};

export const editInstance = async (page: Page, instance: string) => {
  await visitInstance(page, instance);
  await page.getByTestId("tab-link-Configuration").click();
};

export const saveInstance = async (
  page: Page,
  instance: string,
  changeCount: number,
) => {
  const name =
    changeCount === 1 ? "Save 1 change" : `Save ${changeCount} changes`;
  await page.getByRole("button", { name }).click();
  await expect(page.getByText(`Instance ${instance} updated.`)).toBeVisible();
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const forceStopInstance = async (
  page: Page,
  instance: string,
  project = "default",
) => {
  await visitInstance(page, instance, project);
  await page.getByRole("button", { name: "Stop" }).click();
  await page.getByText("Force stop").click();
  await page.getByText("Stop", { exact: true }).click();
  await expect(page.getByText(`Instance ${instance} stopped.`)).toBeVisible();
  await page.getByTestId("notification-close-button").click();
};

export const deleteInstance = async (
  page: Page,
  instance: string,
  project = "default",
) => {
  await visitInstance(page, instance, project);
  const stopButton = page.getByRole("button", { name: "Stop", exact: true });
  if (await stopButton.isEnabled()) {
    await page.keyboard.down("Shift");
    await stopButton.click();
    await page.keyboard.up("Shift");
    await expect(page.getByText(`Instance ${instance} stopped.`)).toBeVisible();
  }
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Instance ${instance} deleted.`);
};

export const renameInstance = async (
  page: Page,
  oldName: string,
  newName: string,
) => {
  await visitInstance(page, oldName);
  await page.locator("li", { hasText: oldName }).click();
  await page.getByRole("textbox").press("Control+a");
  await page.getByRole("textbox").fill(newName);
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForSelector(`text=Instance ${oldName} renamed to ${newName}.`);
};

export const createAndStartInstance = async (
  page: Page,
  instance: string,
  type = "container",
) => {
  await gotoURL(page, "/ui/");
  await page
    .getByRole("link", { name: "Instances", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByLabel("Instance name").click();
  await page.getByLabel("Instance name").fill(instance);
  await page.getByRole("button", { name: "Browse images" }).click();
  await page.getByPlaceholder("Search an image").click();
  await page.getByPlaceholder("Search an image").fill(DEFAULT_IMAGE);
  await page
    .getByRole("row")
    .filter({ hasNotText: "cached" })
    .getByRole("button", { name: "Select" })
    .click();
  await page
    .getByRole("combobox", { name: "Instance type" })
    .selectOption(type);
  await page.getByRole("button", { name: "Create and start" }).first().click();

  await page.waitForSelector(`text=Created and started instance ${instance}.`);
};

export const visitAndStartInstance = async (page: Page, instance: string) => {
  await visitInstance(page, instance);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.waitForSelector(`text=Instance ${instance} started.`);
};

export const visitAndStopInstance = async (page: Page, instance: string) => {
  await visitInstance(page, instance);
  const stopButton = page.getByRole("button", { name: "Stop", exact: true });
  if (await stopButton.isEnabled()) {
    await page.keyboard.down("Shift");
    await stopButton.click();
    await page.keyboard.up("Shift");
    await page.waitForSelector(`text=Instance ${instance} stopped.`);
  }
};

export const createImageFromInstance = async (
  page: Page,
  instance: string,
  imageAlias: string,
) => {
  await removeCustomImages(page);
  await visitInstance(page, instance);
  await page.getByRole("button", { name: "Create Image" }).click();
  await page.getByLabel("Alias").fill(imageAlias);
  await page.getByText("Create image", { exact: true }).click();
  await page.waitForSelector(`text=Image created from instance ${instance}.`);
};

export const removeCustomImages = async (page: Page) => {
  // remove all custom images created during previous runs
  // to avoid failures on retries due to fingerprint conflicts
  await visitImages(page, "default");
  const rows = await page.locator("#image-table tbody tr").all();
  for (const row of rows) {
    const cachedContent = await row.getByLabel("Cached").innerText();
    // custom images are not cached
    if (cachedContent === "No") {
      await page.keyboard.down("Shift");
      await row.getByRole("button", { name: "Delete" }).click();
      await page.keyboard.up("Shift");
      await page.waitForSelector("text=/Image .* deleted\\./");
      await page.getByTestId("notification-close-button").click();
    }
  }
};

export const migrateInstanceRootStorage = async (
  page: Page,
  instance: string,
  pool: string,
) => {
  await visitInstance(page, instance);
  await page.getByRole("button", { name: "Migrate" }).click();
  await page
    .getByRole("button", { name: "Move instance root storage" })
    .click();
  await page
    .getByRole("row")
    .filter({ hasText: pool })
    .getByRole("button", { name: "Select" })
    .click();
  await page
    .getByLabel("Confirm migration")
    .getByRole("button", { name: "Migrate", exact: true })
    .click();
  await page.waitForSelector(
    `text=Instance ${instance} root storage successfully moved to pool ${pool}`,
  );
};
