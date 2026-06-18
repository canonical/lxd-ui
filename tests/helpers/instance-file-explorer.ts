import type { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";
import { dismissNotification } from "./notification";
import { assertTextVisible } from "./permissions";
import { visitInstance } from "./instances";
import { randomNameSuffix } from "./name";

export const randomFileName = (): string => {
  return `playwright-file-${randomNameSuffix()}`;
};
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
  await page.getByRole("link", { name: "File Explorer" }).click();
  await openDirectory(page, "tmp"); //hardcoded for now until file creation is implemented in the UI
  await assertFileExists(page, fileName);
};
