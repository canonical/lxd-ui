import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";

const visitClusterServer = async (page: Page): Promise<void> => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Server", exact: true }).click();
};

test("cluster server page displays hardware details", async ({ page }) => {
  await visitClusterServer(page);

  await expect(page.getByText("Server", { exact: true })).toBeVisible();
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
