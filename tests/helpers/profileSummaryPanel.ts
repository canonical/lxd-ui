import { Page, expect } from "@playwright/test";

export const openProfileSummaryPanel = async (page: Page, profile: string) => {
  const profileRow = page.locator("css=tr[role=row]", { hasText: profile });
  await profileRow.waitFor({ state: "visible" });
  const cells = await profileRow.locator("css=td").all();
  await cells[1].click();
  const profileSummaryPanel = page.locator("css=.detail-panel", {
    hasText: "profile summary",
  });
  await expect(profileSummaryPanel).toBeVisible();
};

export const closeProfileSummaryPanel = async (page: Page) => {
  const closeButton = page.locator("css=button[aria-label=Close]");
  await closeButton.click();
  const profileSummaryPanel = page.locator("css=.detail-panel", {
    hasText: "profile summary",
  });
  await expect(profileSummaryPanel).toHaveCount(0);
};

export const navigateToProfileDetails = async (page: Page, profile: string) => {
  const profileSummaryPanel = page.locator("css=.detail-panel", {
    hasText: "profile summary",
  });
  const detailLink = profileSummaryPanel.locator("css=a", {
    hasText: profile,
  });
  await detailLink.click();
  const profileDetailTitle = page.locator("css=.p-panel__title", {
    hasText: profile,
  });
  await expect(profileDetailTitle).toBeVisible();
};
