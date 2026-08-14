import type { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";
import { getLxcCmd } from "./auth";
import { dismissNotification } from "./notification";
import { visitInstance } from "./instances";
import { randomNameSuffix } from "./name";
import { runCommand } from "./shell";

export const randomFileName = (): string => {
  return `playwright-entry-${randomNameSuffix()}`;
};

export const randomDirectoryName = (): string => {
  return `playwright-dir-${randomNameSuffix()}`;
};

export const randomSymlinkName = (): string => {
  return `playwright-link-${randomNameSuffix()}`;
};

type FileExplorerEntryType = "file" | "directory" | "symlink";

const getFileExplorerRow = (
  page: Page,
  name: string,
  type: FileExplorerEntryType,
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
  await page.getByRole("link", { name: "File Explorer" }).click();
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
};

export const assertFileExists = async (page: Page, fileName: string) => {
  const fileRow = getFileExplorerRow(page, fileName, "file");
  await expect(fileRow).toHaveCount(1);
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

export const createDirectory = async (
  page: Page,
  directoryName: string,
  parentPath?: string,
) => {
  await page.getByRole("button", { name: "Create directory" }).click();

  const dialog = page.getByRole("dialog", { name: "Create directory" });
  await dialog.getByLabel("Directory name").fill(directoryName);
  if (parentPath) {
    await dialog.getByLabel("Parent path").fill(parentPath);
  }
  await dialog.getByRole("button", { name: "Create" }).click();

  await dismissNotification(
    page,
    `Directory ${directoryName} created successfully.`,
  );
};

const runCommandForInstance = (instance: string, command: string) => {
  runCommand(`${getLxcCmd()} exec ${instance} -- ${command}`);
};

export const deleteFile = async (
  page: Page,
  fileName: string,
  instance: string,
) => {
  const fileRow = getFileExplorerRow(page, fileName, "file");
  await fileRow.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();

  await dismissNotification(page, `File ${fileName} deleted from ${instance}`);
};

export const downloadFile = async (page: Page, fileName: string) => {
  const fileRow = getFileExplorerRow(page, fileName, "file");

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

export const createFile = async (
  page: Page,
  instance: string,
  fileName: string,
) => {
  const url = new URL(page.url());
  const currentPath = url.searchParams.get("path") ?? "/";
  const targetPath =
    currentPath === "/" ? `/${fileName}` : `${currentPath}/${fileName}`;

  runCommandForInstance(instance, `touch "${targetPath}"`);
  await page.reload();
  await assertFileExists(page, fileName);
};

export const createSymlink = async (
  page: Page,
  instance: string,
  symlinkName: string,
  targetPath: string,
) => {
  const url = new URL(page.url());
  const currentPath = url.searchParams.get("path") ?? "/";
  const linkPath =
    currentPath === "/" ? `/${symlinkName}` : `${currentPath}/${symlinkName}`;

  runCommandForInstance(instance, `ln -s "${targetPath}" "${linkPath}"`);
  await page.reload();
  const symlinkRow = getFileExplorerRow(page, symlinkName, "symlink");
  await expect(symlinkRow).toHaveCount(1);
};

export const openSymlink = async (page: Page, symlinkName: string) => {
  const symlinkRow = getFileExplorerRow(page, symlinkName, "symlink");
  await symlinkRow
    .getByRole("button", { name: symlinkName, exact: true })
    .click();
};
