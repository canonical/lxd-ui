import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { gotoURL } from "./navigate";
import { expect } from "../fixtures/lxd-test";
import {
  cephObject,
  dirDriver,
  storageDriverLabels,
} from "util/storageOptions";
import { dismissNotification } from "./notification";

export const randomPoolName = (): string => {
  return `playwright-pool-${randomNameSuffix()}`;
};

export const createPool = async (
  page: Page,
  pool: string,
  driver = storageDriverLabels[dirDriver],
) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Storage" }).click();
  await page.getByRole("link", { name: "Pools" }).click();
  await expect(page.getByRole("button", { name: "Create pool" })).toBeVisible();
  if (await page.getByText(pool).isVisible()) {
    await deletePool(page, pool);
  }
  await page.getByRole("button", { name: "Create pool" }).click();
  await page.getByPlaceholder("Enter name").fill(pool);
  await page.getByRole("button", { name: "Driver" }).click();
  await page.getByRole("option", { name: driver }).click();
  if (driver === storageDriverLabels[cephObject]) {
    await page.getByLabel("Rados gateway endpoint").fill("http://localhost");
  }
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await dismissNotification(page, `Storage pool ${pool} created.`);
};

export const deletePool = async (page: Page, pool: string) => {
  await visitPool(page, pool);
  await page.getByRole("button", { name: "Delete pool" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete pool" })
    .click();
  await dismissNotification(page, `Storage pool ${pool} deleted.`);
};

export const visitPool = async (page: Page, pool: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Storage" }).click();
  await page.getByRole("link", { name: "Pools" }).click();
  await page.getByRole("link", { name: pool, exact: true }).first().click();
  await expect(page.getByText(`Storage pools${pool}`)).toBeVisible();
};

export const editPool = async (page: Page, pool: string) => {
  await visitPool(page, pool);
  await page.getByTestId("tab-link-Configuration").click();
};

export const savePool = async (page: Page, pool: string) => {
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await dismissNotification(page, `Storage pool ${pool} updated.`);
};
