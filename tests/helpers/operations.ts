import type { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";
import { gotoURL } from "./navigate";

export const validateOperation = async (page: Page, title: string) => {
  await page.getByText("Operations", { exact: true }).click();
  await expect(page.getByText(title)).toBeVisible();
};

export const visitOperations = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("link", { name: /^Operations/ }).click();
  await expect(
    page.getByRole("heading", { name: "Ongoing operations" }),
  ).toBeVisible();
};
