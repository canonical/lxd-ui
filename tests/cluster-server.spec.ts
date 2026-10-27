import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import { runCommand } from "./helpers/shell";
import { getLxcCmd } from "./helpers/auth";

const visitClusterServer = async (page: Page): Promise<void> => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Server" })
    .click();
  await page.waitForLoadState("networkidle");
};

test("cluster server page displays hardware details", async ({ page }) => {
  await visitClusterServer(page);

  await expect(
    page.getByRole("heading", { name: "Server", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("This server is not clustered", { exact: true }),
  ).toBeVisible();

  const sections = [
    "System",
    "CPU",
    "GPU",
    "Memory",
    "Networks",
    "Storage",
    "PCI",
    "USB",
  ];

  for (const section of sections) {
    await expect(
      page.getByRole("heading", { name: section, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: section, exact: true }),
    ).toHaveAttribute("href", `/ui/cluster/server#${section.toLowerCase()}`);
  }

  await page.getByRole("link", { name: "CPU", exact: true }).click();
  await expect(page).toHaveURL(/\/ui\/cluster\/server#cpu$/);
  await expect(
    page.getByRole("link", { name: "CPU", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await page.getByRole("button", { name: "Close notification" }).click();
  await expect(
    page.getByText("This server is not clustered", { exact: true }),
  ).toBeHidden();
});

test("cluster server page displays the certificate fingerprint", async ({
  page,
}) => {
  const server = JSON.parse(runCommand(`${getLxcCmd()} query /1.0`)) as {
    environment: { certificate_fingerprint: string };
  };
  const fingerprint = server.environment.certificate_fingerprint;

  await visitClusterServer(page);

  const row = page
    .getByRole("row")
    .filter({ hasText: "Certificate fingerprint" });
  await expect(row.getByText(fingerprint, { exact: true })).toBeVisible();
  await expect(
    row.getByRole("button", { name: "Copy to clipboard" }),
  ).toBeVisible();
});
