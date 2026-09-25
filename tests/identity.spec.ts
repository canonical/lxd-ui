import { test, expect } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import { visitIdentityPage } from "./helpers/identity";

test("identity nav entry links to the identity page", async ({ page }) => {
  await gotoURL(page, "/ui/");
  const response = await page.request.get("/1.0");
  const settings = (await response.json()) as {
    metadata: { auth_user_name: string };
  };
  const id = settings.metadata.auth_user_name;

  // the nav entry is titled "<identity name> (<identity id>)"
  await page.getByTitle(`(${id})`).click();
  await expect(page).toHaveURL(/\/ui\/identity/);

  await expect(page.getByRole("heading", { name: "General" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Preferences" }),
  ).toBeVisible();
  await expect(
    page.getByRole("rowheader", { name: "Name", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("row", { name: `ID ${id}` })).toBeVisible();
});

test("theme preference is applied and stored locally", async ({ page }) => {
  await visitIdentityPage(page);

  await page.getByRole("button", { name: "dark", exact: true }).click();
  await expect(page.locator("body")).toHaveClass(/is-dark/);

  await page.getByRole("button", { name: "light", exact: true }).click();
  await expect(page.locator("body")).not.toHaveClass(/is-dark/);

  await page.getByRole("button", { name: "system", exact: true }).click();
});
