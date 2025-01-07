import { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { gotoURL } from "./navigate";
import { expect } from "../fixtures/lxd-test";

export const randomPoolName = (): string => {
  return `playwright-pool-${randomNameSuffix()}`;
};

export const createPool = async (page: Page, pool: string, driver = "dir") => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Storage" }).click();
  await page.getByRole("link", { name: "Pools" }).click();
  await page.getByRole("button", { name: "Create pool" }).click();
  await page.getByPlaceholder("Enter name").fill(pool);
  await page.getByLabel("Driver").selectOption(driver);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Storage pool ${pool} created.`);
};

export const deletePool = async (page: Page, pool: string) => {
  await visitPool(page, pool);
  await page.getByRole("button", { name: "Delete pool" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete pool" })
    .click();
  await page.waitForSelector(`text=Storage pool ${pool} deleted.`);
};

export const visitPool = async (page: Page, pool: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Storage" }).click();
  await page.getByRole("link", { name: "Pools" }).click();
  await page.getByRole("link", { name: pool }).first().click();
  await expect(page.getByText(`Storage pools${pool}`)).toBeVisible();
};

export const editPool = async (page: Page, pool: string) => {
  await visitPool(page, pool);
  await page.getByTestId("tab-link-Configuration").click();
};

export const savePool = async (page: Page, pool: string) => {
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await page.waitForSelector(`text=Storage pool ${pool} updated.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};
