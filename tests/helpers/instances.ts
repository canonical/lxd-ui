import { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";

export const randomInstanceName = (): string => {
  return `playwright-instance-${randomNameSuffix()}`;
};

export const createInstance = async (
  page: Page,
  instance: string,
  type = "container",
) => {
  await page.goto("/ui/");
  await page
    .getByRole("link", { name: "Instances", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByLabel("Instance name").click();
  await page.getByLabel("Instance name").fill(instance);
  await page.getByRole("button", { name: "Browse images" }).click();
  await page.getByPlaceholder("Search an image").click();
  await page.getByPlaceholder("Search an image").fill("jammy");
  await page
    .getByRole("row")
    .filter({
      hasText: "Ubuntu Minimal",
    })
    .getByRole("button", { name: "Select" })
    .last()
    .click();
  await page
    .getByRole("combobox", { name: "Instance type" })
    .selectOption(type);
  await page.getByRole("button", { name: "Create" }).first().click();

  await page.waitForSelector(`text=Created instance ${instance}.`);
};

export const visitInstance = async (page: Page, instance: string) => {
  await page.goto("/ui/");
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(instance);
  await page.getByRole("link", { name: instance }).first().click();
};

export const editInstance = async (page: Page, instance: string) => {
  await visitInstance(page, instance);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByRole("button", { name: "Edit instance" }).click();
};

export const saveInstance = async (page: Page, instance: string) => {
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForSelector(`text=Instance ${instance} updated.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const deleteInstance = async (page: Page, instance: string) => {
  await visitInstance(page, instance);
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
  await page.goto("/ui/");
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
  await page.goto("/ui/");
  await page
    .getByRole("link", { name: "Instances", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByLabel("Instance name").click();
  await page.getByLabel("Instance name").fill(instance);
  await page.getByRole("button", { name: "Browse images" }).click();
  await page.getByPlaceholder("Search an image").click();
  await page.getByPlaceholder("Search an image").fill("jammy");
  await page
    .getByRole("row")
    .filter({
      hasText: "Ubuntu Minimal",
    })
    .getByRole("button", { name: "Select" })
    .last()
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
