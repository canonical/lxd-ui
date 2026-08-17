import type { Page } from "@playwright/test";
import { PANEL_SELECTOR } from "./a11y";

export const gotoURL = async (page: Page, url: string) => {
  await page.goto(url, { waitUntil: "commit" });
};

export const gotoURLWithNetworkIdle = async (page: Page, url: string) => {
  await page.goto(url, { waitUntil: "networkidle" });
};

export const clickSideNavItem = async (
  page: Page,
  slug: string,
  parentSlug?: string,
): Promise<void> => {
  await gotoURL(page, `/ui/project/default`);
  await page.waitForLoadState("networkidle");

  if (parentSlug) {
    const parentButton = page.getByRole("button", { name: parentSlug });
    const isExpanded = await parentButton.getAttribute("aria-expanded");
    if (isExpanded !== "true") {
      await parentButton.click();
    }
  }
  await page.getByRole("link", { name: slug, exact: true }).first().click();
  await page.waitForLoadState("networkidle");
};

export const closePanel = async (page: Page): Promise<void> => {
  const panel = page.locator(PANEL_SELECTOR);
  const cancelButton = panel.getByRole("button", { name: "Cancel" });
  const closeButton = panel.locator("button[aria-label=Close]");

  if (await cancelButton.isVisible()) {
    await cancelButton.click();
  } else {
    await closeButton.click();
  }

  await panel.waitFor({ state: "hidden" });
};
