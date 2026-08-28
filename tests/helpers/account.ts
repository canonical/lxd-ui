import { expect, type Page } from "@playwright/test";
import { gotoURL } from "./navigate";

export const openAccountMenu = async (page: Page) => {
  const accountMenu = page.locator(".sidenav-bottom-ul .accordion-nav-menu");
  await accountMenu.click();
};

export const visitAccountPreferences = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await openAccountMenu(page);
  await page.getByRole("link", { name: "Preferences", exact: true }).click();
  await expect(page).toHaveURL(/\/ui\/account\/preferences/);
};
