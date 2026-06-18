import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { gotoURL } from "./navigate";
import { expect } from "../fixtures/lxd-test";
import { visitLocalImages } from "./images";
import { searchEntityListPage } from "./search";
import { dismissNotification } from "./notification";
import { assertTextVisible } from "./permissions";

const DEFAULT_IMAGE = "alpine/3.23/cloud";

export const randomInstanceName = (): string => {
  return `playwright-instance-${randomNameSuffix()}`;
};

export const randomImageName = (): string => {
  return `playwright-image-${randomNameSuffix()}`;
};

export const randomFileName = (): string => {
  return `playwright-file-${randomNameSuffix()}`;
};

export const selectAllInstances = async (page: Page) => {
  await page.getByLabel("multiselect rows").first().click();
  await page.getByRole("menuitem", { name: "Select all instances" }).click();
};

export const visitCreateInstancePage = async (
  page: Page,
  project = "default",
) => {
  await gotoURL(page, `/ui/project/${project}`);
  await page.waitForLoadState("networkidle");
  await page
    .getByRole("link", { name: "Instances", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Create instance" }).click();
};

export const createInstance = async (
  page: Page,
  instance: string,
  type = "container",
  project = "default",
  image = DEFAULT_IMAGE,
) => {
  await visitCreateInstancePage(page, project);
  await page.getByLabel("Instance name").click();
  await page.getByLabel("Instance name").fill(instance);
  await page.getByRole("button", { name: "Browse images" }).click();
  const dialog = page.getByRole("dialog", { name: "Select base image" });
  await dialog.getByRole("combobox", { name: "Type" }).selectOption(type);
  await page.getByPlaceholder("Search an image").click();
  await page.getByPlaceholder("Search an image").fill(image);
  await page
    .getByRole("row")
    .filter({ hasNotText: "cached" })
    .getByRole("button", { name: "Select" })
    .first()
    .click();

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
  await dismissNotification(page, `Instance ${instance} updated.`);
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
  await dismissNotification(page, `Instance ${instance} stopped.`);
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
  await dismissNotification(page, `Instance ${instance} deleted.`);
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
  await dismissNotification(page, `Instance ${oldName} renamed to ${newName}.`);
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
  await page.getByText(`Created and started instance ${instance}.`).waitFor();
};

export const visitAndStartInstance = async (page: Page, instance: string) => {
  await visitInstance(page, instance);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await dismissNotification(page, `Instance ${instance} started.`);
};

export const visitAndStopInstance = async (page: Page, instance: string) => {
  await visitInstance(page, instance);
  const stopButton = page.getByRole("button", { name: "Stop", exact: true });
  if (await stopButton.isEnabled()) {
    await page.keyboard.down("Shift");
    await stopButton.click();
    await page.keyboard.up("Shift");
    await dismissNotification(page, `Instance ${instance} stopped.`);
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
  await dismissNotification(page, `Image created from instance ${instance}.`);
};

export const removeCustomImages = async (page: Page) => {
  // remove all custom images created during previous runs
  // to avoid failures on retries due to fingerprint conflicts
  await visitLocalImages(page, "default");
  const rows = await page.locator("#image-table tbody tr").all();
  for (const row of rows) {
    const cachedContent = await row.getByLabel("Cached").innerText();
    // custom images are not cached
    if (cachedContent === "No") {
      await page.keyboard.down("Shift");
      await row.getByRole("button", { name: "Delete" }).click();
      await page.keyboard.up("Shift");
      await dismissNotification(page, `deleted`);
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
  await dismissNotification(
    page,
    `Instance ${instance} root storage successfully moved to pool ${pool}.`,
  );
};

// File Explorer Helpers

const getFileExplorerRow = (
  page: Page,
  name: string,
  type: "file" | "directory",
) => {
  const table = page.getByRole("grid").first();
  return table
    .getByRole("row")
    .filter({ hasText: name })
    .filter({ hasText: type });
};

export const visitFileExplorer = async (
  page: Page,
  instance: string,
  project = "default",
) => {
  await visitInstance(page, instance, project);
  await page.getByTestId("tab-link-File Explorer").click();
  await expect(page.getByText("Directory: root")).toBeVisible();
};

export const openDirectory = async (page: Page, directoryName: string) => {
  const row = getFileExplorerRow(page, directoryName, "directory");
  const dirLink = row.getByRole("link", {
    name: directoryName,
    exact: true,
  });
  await expect(dirLink).toHaveCount(1);
  await dirLink.click();

  const breadcrumb = page.getByRole("navigation", {
    name: "File Explorer Path",
  });
  await expect(
    breadcrumb.getByText(directoryName, { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("grid").first()).toBeVisible();
};

export const assertFileExists = async (page: Page, fileName: string) => {
  const fileRow = getFileExplorerRow(page, fileName, "file");
  await expect(fileRow).toBeVisible();
};

export const assertFileNotExists = async (page: Page, fileName: string) => {
  const fileRow = getFileExplorerRow(page, fileName, "file");
  await expect(fileRow).toHaveCount(0);
};

export const assertDirectoryExists = async (
  page: Page,
  directoryName: string,
) => {
  const dirLink = getFileExplorerRow(
    page,
    directoryName,
    "directory",
  ).getByRole("link", {
    name: directoryName,
    exact: true,
  });
  await expect(dirLink).toHaveCount(1);
};

export const deleteFile = async (
  page: Page,
  fileName: string,
  instnace: string,
) => {
  const fileRow = getFileExplorerRow(page, fileName, "file");
  await expect(fileRow).toBeVisible();

  await fileRow.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();

  await dismissNotification(page, `File ${fileName} deleted from ${instnace}`);
};

export const downloadFile = async (page: Page, fileName: string) => {
  const fileRow = getFileExplorerRow(page, fileName, "file");
  await expect(fileRow).toBeVisible();

  // Setup download promise before clicking the file link.
  const downloadPromise = page.waitForEvent("download");
  await fileRow.getByRole("link", { name: fileName, exact: true }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(fileName);

  return download;
};

export const uploadFile = async (page: Page, filePath: string) => {
  const uploadButton = page.getByTitle("Upload files to current directory");
  await uploadButton.click();

  // Bypass the OS-native file picker dialog by directly setting the file input
  await page.locator('input[type="file"]').setInputFiles(filePath);
  await dismissNotification(page, " uploaded successfully");
};

export const createFile = async (page: Page, fileName: string) => {
  // Use terminal to create files for now. Later we might add a file creation feature in the file explorer.
  const url = new URL(page.url());
  const currentPath = url.searchParams.get("path") ?? "/";
  const targetPath =
    currentPath === "/" ? `/${fileName}` : `${currentPath}/${fileName}`;

  await page.getByTestId("tab-link-Terminal").click();
  await assertTextVisible(page, "~#");
  await page.waitForTimeout(1000); // ensure the terminal is ready
  await page.locator(".xterm-rows").evaluate((e) => {
    (e as HTMLElement).click();
  });
  await page.keyboard.type(`touch "${targetPath}"`, {
    delay: 100,
  });
  await page.keyboard.press("Enter");

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByTestId("tab-link-File Explorer").click();
  await openDirectory(page, "tmp"); //hardcoded for now until file creation is implemented in the UI
  await assertFileExists(page, fileName);
};
