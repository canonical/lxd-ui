import { expect, type Page } from "@playwright/test";
import { gotoURL } from "./navigate";

export const visitIdentityPage = async (page: Page) => {
  await gotoURL(page, "/ui/identity");
  await expect(
    page.getByRole("heading", { name: "Preferences" }),
  ).toBeVisible();
};
