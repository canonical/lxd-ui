import { test, expect } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import { visitIdentityPage } from "./helpers/identity";

test("identity nav entry links to the identity page", async ({ page }) => {
  await visitIdentityPage(page);

  await expect(page.getByRole("heading", { name: "Identity" })).toBeVisible();
  await expect(page.locator("#identity-name")).toBeVisible();
  await expect(page.locator("#identity-id")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Preferences" }),
  ).toBeVisible();
});

test("theme preference is applied and stored locally", async ({ page }) => {
  await gotoURL(page, "/ui/identity");

  await page.getByRole("button", { name: "dark", exact: true }).click();
  await expect(page.locator("body")).toHaveClass(/is-dark/);

  await page.getByRole("button", { name: "light", exact: true }).click();
  await expect(page.locator("body")).not.toHaveClass(/is-dark/);

  await page.getByRole("button", { name: "system", exact: true }).click();
});
