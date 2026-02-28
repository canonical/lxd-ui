import type { Page } from "@playwright/test";

export const searchEntityListPage = async (page: Page, name: string) => {
  await page.getByPlaceholder("Search and filter").fill(name.toLowerCase());
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");
};
