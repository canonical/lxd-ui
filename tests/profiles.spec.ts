import { test, expect } from "@playwright/test";

test("profile create and remove", async ({ page }) => {
  const profileName = randomProfileName();

  await page.goto("/");
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByRole("button", { name: "Add profile" }).click();
  await page.getByRole("button", { name: "Quick create profile" }).click();
  await page.getByLabel("Profile name").click();
  await page.getByLabel("Profile name").fill(profileName);
  await page.getByRole("button", { name: "Create profile" }).click();
  await page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: profileName })
    .getByRole("button", { name: "Delete" })
    .click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();

  await expect(page.getByText("Profile deleted.")).toBeVisible();
});

const randomProfileName = (): string => {
  const r = (Math.random() + 1).toString(36).substring(7);
  return `playwright-profile-${r}`;
};
