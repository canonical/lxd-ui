import { expect, test, type LxdVersions } from "../fixtures/lxd-test";
import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import { randomNameSuffix } from "./name";
import { dismissNotification } from "./notification";
import { searchEntityListPage } from "./search";

export const randomImageRegistryName = () => {
  return `playwright-image-registry-${randomNameSuffix()}`;
};

export const skipIfNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "latest-edge" ||
      lxdVersion === "5.0-edge" ||
      lxdVersion === "5.21-edge",
    "Image registries page are currently not available",
  );
};

export const visitImageRegistries = async (page: Page) => {
  await gotoURL(page, `/ui/image-registries`);
  await expect(page.getByTitle("Create registry")).toBeVisible();
};

export const visitImageRegistry = async (page: Page, name: string) => {
  await visitImageRegistries(page);
  await searchEntityListPage(page, name);
  await page
    .getByRole("row")
    .filter({ hasText: name })
    .getByRole("rowheader", { name: "Name" })
    .getByRole("link")
    .click();
  await expect(
    page.getByRole("button").filter({ hasText: "Edit registry" }),
  ).toBeVisible();
};

export const createImageRegistry = async (
  page: Page,
  name: string,
  protocol: "SimpleStreams" | "LXD",
  config: { url?: string; cluster?: string; sourceProject?: string } = {},
) => {
  await visitImageRegistries(page);
  await page.getByTitle("Create registry").click();
  const sidePanel = page.getByLabel("Side panel");
  await sidePanel.getByPlaceholder("Enter name").fill(name);
  await sidePanel.getByRole("radio", { name: protocol }).check({ force: true });

  if (config.url) {
    await sidePanel.getByLabel("Server").fill(config.url);
  }
  if (config.cluster) {
    await sidePanel
      .getByLabel("Cluster")
      .selectOption({ label: config.cluster });
  }
  if (config.sourceProject) {
    await sidePanel.getByLabel("Source project").fill(config.sourceProject);
  }
  await sidePanel.getByRole("button", { name: "Create", exact: true }).click();
  await dismissNotification(page, `Image registry ${name} created.`);
};

export const deleteImageRegistry = async (page: Page, name: string) => {
  await visitImageRegistry(page, name);
  await page.getByRole("button", { name: "Delete registry" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete", exact: true })
    .getByRole("button", { name: "Delete registry", exact: true })
    .click();
  await dismissNotification(page, `Image registry ${name} deleted.`);
};

export const openImageRegistryEditPanel = async (page: Page, name: string) => {
  await visitImageRegistry(page, name);
  await page.getByRole("button").filter({ hasText: "Edit registry" }).click();
  await page
    .getByRole("heading", { name: "Edit image registry", exact: true })
    .isVisible();
};
