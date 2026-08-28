import { test, expect } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import { openAccountMenu } from "./helpers/account";

test("account menu links to the identity page", async ({ page }) => {
  await gotoURL(page, "/ui/");
  await openAccountMenu(page);
  await page.getByRole("link", { name: "Identity", exact: true }).click();

  await expect(page).toHaveURL(/\/ui\/account\/identity/);
  await expect(page.getByRole("heading", { name: "Identity" })).toBeVisible();
  await expect(page.locator("#identity-name")).toBeVisible();
  await expect(page.locator("#identity-id")).toBeVisible();
});

test("deep link to preferences opens the account menu", async ({ page }) => {
  await gotoURL(page, "/ui/account/preferences");

  await expect(
    page.getByRole("link", { name: "Preferences", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Theme" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Login project" }),
  ).toBeVisible();
});

test("theme preference is applied and stored locally", async ({ page }) => {
  await gotoURL(page, "/ui/account/preferences");

  await page.getByRole("button", { name: "dark", exact: true }).click();
  await expect(page.locator("body")).toHaveClass(/is-dark/);

  await page.getByRole("button", { name: "light", exact: true }).click();
  await expect(page.locator("body")).not.toHaveClass(/is-dark/);

  await page.getByRole("button", { name: "system", exact: true }).click();
});
