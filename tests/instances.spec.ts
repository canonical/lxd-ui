import { test, Page } from "@playwright/test";
import { TIMEOUT } from "./constants";

test("instance create and remove", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await deleteInstance(page, instance);
});

const randomInstanceName = (): string => {
  const r = (Math.random() + 1).toString(36).substring(7);
  return `playwright-instance-${r}`;
};

export const createInstance = async (page: Page, name: string) => {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Instances" }).click();
  await page.getByRole("button", { name: "Add instance" }).click();
  await page.getByLabel("Instance name").click();
  await page.getByLabel("Instance name").fill(name);
  await page.getByRole("button", { name: "Select image" }).click();
  await page
    .getByPlaceholder("Search for distributions, releases or or aliases")
    .click();
  await page
    .getByPlaceholder("Search for distributions, releases or or aliases")
    .fill("alpine");
  await page
    .getByRole("row", {
      name: "Distribution Release Architecture Alias Action",
    })
    .getByRole("button", { name: "Select" })
    .first()
    .click();
  await page.getByRole("button", { name: "Create" }).first().click();

  await page.waitForSelector(`text=Instance ${name} created.`, TIMEOUT);
};

export const deleteInstance = async (page: Page, instanceName: string) => {
  await page.goto(`/ui/instances/${instanceName}`);
  await page.waitForTimeout(10000).then(async () => {
    await page.getByRole("button", { name: "Delete" }).click();
    await page
      .getByRole("dialog", { name: "Confirm delete" })
      .getByRole("button", { name: "Delete" })
      .click();

    await page.waitForSelector("text=Add instance", TIMEOUT);
  });
};
