import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { gotoURL } from "./navigate";
import { expect } from "../fixtures/lxd-test";

export const randomInstanceName = (): string => {
  return `playwright-instance-${randomNameSuffix()}`;
};

export const randomImageName = (): string => {
  return `playwright-image-${randomNameSuffix()}`;
};

export const createInstance = async (
  page: Page,
  instance: string,
  type = "container",
  project = "default",
  image = "alpine/3.19/cloud",
) => {
  await gotoURL(page, `/ui/project/${project}`);
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
    await page.getByRole("button", { name: "Create override" }).click();
  }

  await page.getByRole("button", { name: "Create" }).first().click();

  await page.waitForSelector(`text=Created instance ${instance}.`);
};

export const visitInstance = async (
  page: Page,
  instance: string,
  project = "default",
) => {
  await gotoURL(page, `/ui/project/${project}`);
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(instance);
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
  await page.waitForSelector(`text=Instance ${instance} updated.`);
  await page.getByRole("button", { name: "Close notification" }).click();
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
    await page.waitForSelector(`text=Instance ${instance} stopped.`);
  }
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Instance ${instance} deleted.`);
};

export const hasInstance = async (page: Page, instance: string) => {
  await gotoURL(page, "/ui/");
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(instance);
  return await page.getByRole("link", { name: instance }).first().isVisible();
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
  await page.getByPlaceholder("Search an image").fill("alpine/3.19/cloud");
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

export const createImageFromInstance = async (page: Page, instance: string) => {
  const imageAlias = randomImageName();
  await visitInstance(page, instance);
  await page.getByRole("button", { name: "Create Image" }).click();
  await page.getByLabel("Alias").fill(imageAlias);
  await page.getByText("Create image", { exact: true }).click();
  await page.waitForSelector(`text=Image created from instance ${instance}.`);

  return imageAlias;
};

export const migrateInstanceRootStorage = async (
  page: Page,
  instance: string,
  pool: string,
  serverClustered: boolean,
) => {
  await visitInstance(page, instance);
  await page.getByRole("button", { name: "Migrate" }).click();
  if (serverClustered) {
    await page
      .getByRole("button", { name: "Move instance root storage" })
      .click();
  }
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
