import { Page } from "@playwright/test";
import { TIMEOUT } from "./constants";
import { randomNameSuffix } from "./name";

export const randomNetworkName = (): string => {
  return `test-${randomNameSuffix()}`;
};

export const createNetwork = async (page: Page, network: string) => {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Networks" }).click();
  await page.getByRole("button", { name: "Create network" }).click();
  await page.getByRole("heading", { name: "Create a network" }).click();
  await page.getByLabel("Name").click();
  await page.getByLabel("Name").fill(network);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Network ${network} created.`, TIMEOUT);
};

export const deleteNetwork = async (page: Page, network: string) => {
  await visitNetwork(page, network);
  await page.getByRole("button", { name: "Delete network" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Network ${network} deleted.`, TIMEOUT);
};

export const visitNetwork = async (page: Page, network: string) => {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Networks" }).click();
  await page.getByRole("link", { name: network }).first().click();
};

export const saveNetwork = async (page: Page) => {
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForSelector(`text=Network updated.`, TIMEOUT);
};

export const editNetwork = async (page: Page, network: string) => {
  await visitNetwork(page, network);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByRole("button", { name: "Edit network" }).click();
};
