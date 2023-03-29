import { Page } from "@playwright/test";
import { TIMEOUT } from "./constants";

export const randomInstanceName = (): string => {
  const r = (Math.random() + 1).toString(36).substring(7);
  return `playwright-instance-${r}`;
};

export const createInstance = async (page: Page, instance: string) => {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Instances" }).click();
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByLabel("Instance name").click();
  await page.getByLabel("Instance name").fill(instance);
  await page.getByRole("button", { name: "Browse images" }).click();
  await page.getByPlaceholder("Search an image").click();
  await page.getByPlaceholder("Search an image").fill("alpine");
  await page
    .getByRole("row", {
      name: "Distribution Release Variant Type Alias Action",
    })
    .getByRole("button", { name: "Select" })
    .first()
    .click();
  await page.getByRole("button", { name: "Create" }).first().click();

  await page.waitForSelector(`text=Launched instance ${instance}.`, TIMEOUT);
};

export const deleteInstance = async (page: Page, instance: string) => {
  await page.goto(`/`);
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(instance);
  await page.getByRole("link", { name: instance }).first().click();

  await page.waitForTimeout(10000).then(async () => {
    await page.getByRole("button", { name: "Delete" }).click();
    await page
      .getByRole("dialog", { name: "Confirm delete" })
      .getByRole("button", { name: "Delete" })
      .click();

    await page.waitForSelector(`text=Instance ${instance} deleted.`, TIMEOUT);
  });
};

export const hasInstance = async (page: Page, instance: string) => {
  await page.goto(`/`);
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(instance);
  return await page.getByRole("link", { name: instance }).first().isVisible();
};
