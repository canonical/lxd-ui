import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import { randomNameSuffix } from "./name";
import type { LxdVersions } from "../fixtures/lxd-test";
import { test } from "../fixtures/lxd-test";

export const skipIfNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "Cluster tests not supported for lxd 5.0",
  );
};

export const isServerClustered = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Members" }).click();
  const count = await page.getByText("This server is not clustered").count();
  return count === 0;
};

export const randomGroupName = (): string => {
  return `playwright-cluster-group-${randomNameSuffix()}`;
};

export const createClusterGroup = async (page: Page, group: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Groups" }).click();
  await page.getByRole("button", { name: "Create group" }).click();
  await page.getByPlaceholder("Enter name").click();
  await page.getByPlaceholder("Enter name").fill(group);
  const panel = page.getByLabel("Side panel");
  await panel.getByRole("button", { name: "Create group" }).click();

  await page.waitForSelector(`text=Cluster group ${group} created.`);
};

export const deleteClusterGroup = async (page: Page, group: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Groups" }).click();
  await page
    .getByRole("row", { name: group })
    .getByRole("button", { name: "Delete group" })
    .click();
  await page.getByText("Delete", { exact: true }).click();

  await page.waitForSelector(`text=Cluster group ${group} deleted.`);
};

export const toggleClusterGroupMember = async (
  page: Page,
  group: string,
  member: string,
) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Groups" }).click();
  await page
    .getByRole("row", { name: group })
    .getByRole("button", { name: "Edit group" })
    .click();
  await page
    .getByRole("rowheader", { name: `Select ${member}` })
    .locator("span")
    .click();
  await page.getByRole("button", { name: "Save changes" }).click();

  await page.waitForSelector(`text=Cluster group ${group} saved.`);
};

export const getFirstClusterMember = async (page: Page): Promise<string> => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Members" }).click();
  const firstCellContent = await page
    .getByRole("rowheader")
    .first()
    .textContent();
  return firstCellContent?.split("http")[0] ?? "";
};
