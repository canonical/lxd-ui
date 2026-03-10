import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import {
  removeCertificateTrust,
  restoreCertificateTrust,
} from "./helpers/auth";

const loginUser = async (page: Page) => {
  await page.getByRole("link", { name: "Login with SSO" }).click();
  await page.getByLabel("Email address").click();
  await page.getByLabel("Email address").fill(process.env.LXD_OIDC_USER || "");
  await page.getByLabel("Password *").click();
  await page.getByLabel("Password *").fill(process.env.LXD_OIDC_PASSWORD || "");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Log out")).toBeVisible();
};

test("login", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("login"));
  // remove tls certificate from trust store so we can test oidc login
  removeCertificateTrust();

  await gotoURL(page, "/ui/");
  await loginUser(page);
  await page.getByText("Log out").click();

  // add tls certificate to trust store so rest of tests can run correctly
  restoreCertificateTrust();
});
