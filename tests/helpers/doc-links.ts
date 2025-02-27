import type { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";

export const validateLink = async (
  page: Page,
  linkText: string,
  link: string,
) => {
  await expect(
    page.getByRole("link", { name: linkText, exact: true }).first(),
  ).toHaveAttribute("href", link);
};
