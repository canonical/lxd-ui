import { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";

export const validateOperation = async (
  page: Page,
  title: string,
  instance: string,
) => {
  await expect(
    page.getByLabel("Action", { exact: true }).getByText(title + instance),
  ).toBeVisible();
};
