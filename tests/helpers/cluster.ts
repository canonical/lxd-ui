import { Page } from "@playwright/test";

export const isServerClustered = async (page: Page) => {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Cluster" }).click();
  const count = await page.getByText("This server is not clustered").count();
  return count === 0;
};
