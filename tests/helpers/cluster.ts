import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";

export const isServerClustered = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("link", { name: "Cluster" }).click();
  const count = await page.getByText("This server is not clustered").count();
  return count === 0;
};
