import { test } from "@playwright/test";
import { TIMEOUT } from "./constants";

test("profile create and remove", async ({ page }) => {
  const profileName = randomProfileName();

  await page.goto("/ui/");
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByRole("button", { name: "Create new" }).click();
  await page.getByLabel("Profile name").click();
  await page.getByLabel("Profile name").fill(profileName);
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForSelector(`text=Profile ${profileName} created.`, TIMEOUT);

  await page.getByRole("link", { name: profileName }).first().click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();

  await page.waitForSelector(`text=Profile ${profileName} deleted.`, TIMEOUT);
});

const randomProfileName = (): string => {
  const r = (Math.random() + 1).toString(36).substring(7);
  return `playwright-profile-${r}`;
};
