import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { gotoURL } from "./navigate";

export const openInstancePanel = async (page: Page, instance: string) => {
  await gotoURL(page, "/ui/");
  const instanceRow = page.getByRole("row", { name: instance }).first();
  await instanceRow.waitFor({ state: "visible" });
  const cells = instanceRow.locator(":has-text('Container')");
  await cells.click();
  const instanceDetailPanel = page.locator("css=.detail-panel", {
    hasText: "instance summary",
  });
  await expect(instanceDetailPanel).toBeVisible();
};

export const closeInstancePanel = async (page: Page) => {
  const closeButton = page.locator("css=button[aria-label=Close]");
  await closeButton.click();
  const instanceDetailPanel = page.locator("css=.detail-panel", {
    hasText: "instance summary",
  });
  await expect(instanceDetailPanel).toHaveCount(0);
};

export const startInstanceFromPanel = async (page: Page, instance: string) => {
  const instanceDetailPanel = page.locator("css=.detail-panel", {
    hasText: "instance summary",
  });
  const startButton = instanceDetailPanel.locator("css=button[title=Start]");
  await startButton.click();

  await page.waitForSelector(`text=Instance ${instance} started.`);
  await page.getByTestId("notification-close-button").click();
  await checkInstanceStatus(page, "Running");
};

export const stopInstanceFromPanel = async (page: Page, instance: string) => {
  const instanceDetailPanel = page.locator("css=.detail-panel", {
    hasText: "instance summary",
  });
  const stopButton = instanceDetailPanel.locator("css=button[title=Stop]");
  await stopButton.click();
  const confirmModal = page.locator("css=.p-modal");
  await confirmModal.waitFor({ state: "visible" });
  await page.getByText("Force stop").click();
  const confirmStopButton = confirmModal.locator("css=button", {
    hasText: "Stop",
  });
  await confirmStopButton.click();

  await page.waitForSelector(`text=Instance ${instance} stopped.`);
  await page.getByTestId("notification-close-button").click();
  await checkInstanceStatus(page, "Stopped");
};

export const navigateToInstanceDetails = async (
  page: Page,
  instance: string,
) => {
  const instanceDetailPanel = page.locator("css=.detail-panel", {
    hasText: "instance summary",
  });
  const detailLink = instanceDetailPanel.locator("css=a", {
    hasText: instance,
  });
  await detailLink.click();
  const instanceDetailTitle = page.locator("css=.instance-detail-title", {
    hasText: instance,
  });
  await expect(instanceDetailTitle).toBeVisible();
};

export const checkInstanceStatus = async (page: Page, status: string) => {
  const sidePanel = page.getByLabel("Side panel");
  const statusRow = sidePanel.getByRole("row", { name: "Status" });
  await expect(statusRow.getByRole("cell", { name: status })).toBeVisible();
};
