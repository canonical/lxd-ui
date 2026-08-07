import type { Page } from "@playwright/test";
import { type LxdVersions, test, expect } from "../fixtures/lxd-test";
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

export const skipIfChildOperationsNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge",
    "Child operations not supported for lxd 5.0 and 5.21",
  );
};
