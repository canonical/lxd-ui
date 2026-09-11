import { expect, type Page } from "@playwright/test";
import { gotoURL } from "./navigate";

export const visitIdentityPage = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.locator('.sidenav-bottom-ul a[href$="/ui/identity"]').click();
  await expect(page).toHaveURL(/\/ui\/identity/);
};
