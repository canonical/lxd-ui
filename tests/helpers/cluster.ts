import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import { randomNameSuffix } from "./name";

export const isServerClustered = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("link", { name: "Cluster" }).click();
  const count = await page.getByText("This server is not clustered").count();
  return count === 0;
};

export const randomGroupName = (): string => {
  return `playwright-cluster-group-${randomNameSuffix()}`;
};

export const createClusterGroup = async (page: Page, group: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("link", { name: "Cluster" }).click();
  await page.getByRole("button", { name: "All cluster groups" }).click();
  await page.getByRole("button", { name: "Create group" }).click();
  await page.getByPlaceholder("Enter name").click();
  await page.getByPlaceholder("Enter name").fill(group);
  await page.getByRole("button", { name: "Create" }).click();

  await page.waitForSelector(`text=Cluster group ${group} created.`);
};

export const deleteClusterGroup = async (page: Page, group: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("link", { name: "Cluster" }).click();
  await page.getByRole("button", { name: "All cluster groups" }).click();
  await page.getByRole("link", { name: group }).click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByText("Delete", { exact: true }).click();

  await page.waitForSelector(`text=Cluster group ${group} deleted.`);
};

export const toggleClusterGroupMember = async (
  page: Page,
  group: string,
  member: string,
) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("link", { name: "Cluster" }).click();
  await page.getByRole("button", { name: "All cluster groups" }).click();
  await page.getByRole("link", { name: group }).click();
  await page.getByRole("button", { name: "Edit group" }).click();
  await page
    .getByRole("rowheader", { name: `Select ${member}` })
    .locator("span")
    .click();
  await page.getByRole("button", { name: "Save changes" }).click();

  await page.waitForSelector(`text=Cluster group ${group} saved.`);
};

export const getFirstClusterMember = async (page: Page): Promise<string> => {
  await gotoURL(page, "/ui/");
  await page.getByRole("link", { name: "Cluster" }).click();
  const firstCellContent = await page
    .getByRole("rowheader")
    .first()
    .textContent();
  return firstCellContent?.split("http")[0] ?? "";
};
