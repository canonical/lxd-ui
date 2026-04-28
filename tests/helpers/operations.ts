import type { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";

export const validateOperation = async (page: Page, title: string) => {
  await page.getByText("Operations", { exact: true }).click();
  await expect(page.getByText(title)).toBeVisible();
};
