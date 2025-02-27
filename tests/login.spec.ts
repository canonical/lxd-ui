import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures/lxd-test";
import { execSync } from "child_process";
import { gotoURL } from "./helpers/navigate";

const loginUser = async (page: Page) => {
  await page.getByRole("link", { name: "Login with SSO" }).click();
  await page.getByLabel("Email address").click();
  await page.getByLabel("Email address").fill(process.env.LXD_OIDC_USER || "");
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill(process.env.LXD_OIDC_PASSWORD || "");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Log out")).toBeVisible();
};

test("login", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("login"));
  // remove tls certificate from trust store so we can test oidc login
  const fingerprint = execSync(
    "sudo -E lxc config trust list | grep lxd-ui.crt | awk '{print $8}'",
  ).toString();
  execSync(`sudo -E lxc config trust remove ${fingerprint}`);

  await gotoURL(page, "/ui/");
  await loginUser(page);
  await page.getByText("Log out").click();

  // add tls certificate to trust store so rest of tests can run correctly
  execSync("sudo -E lxc config trust add keys/lxd-ui.crt");
});
