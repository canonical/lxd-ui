import { Page } from "@playwright/test";
import { test as setup, expect, authFile } from "../fixtures/lxd-test";

const loginUser = async (page: Page) => {
  await page.getByRole("link", { name: "Login with SSO" }).click();
  await page.getByLabel("Email address*").click();
  await page.getByLabel("Email address*").fill(process.env.LXD_OIDC_USER || "");
  await page.getByLabel("Password*").click();
  await page.getByLabel("Password*").fill(process.env.LXD_OIDC_PASSWORD || "");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Log out")).toBeVisible();
};

setup("authenticate", async ({ page }) => {
  await page.goto("/ui/");
  await loginUser(page);
  // Check logout functionality
  await page.getByText("Log out").click();
  await expect(
    page.getByRole("link", { name: "Login with SSO" }),
  ).toBeVisible();
  await loginUser(page);

  await page.context().storageState({ path: authFile });
});
