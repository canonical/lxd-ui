import { Page } from "@playwright/test";
import { test } from "./fixtures/lxd-test";
import { randomNameSuffix } from "./helpers/name";

test("cluster group create and delete", async ({ page }) => {
  const group = randomGroupName();
  await createClusterGroup(page, group);
  await deleteClusterGroup(page, group);
});

test("cluster group add and remove members", async ({ page }) => {
  const group = randomGroupName();
  const member = await getFirstClusterMember(page);
  await createClusterGroup(page, group);
  await toggleClusterGroupMember(page, group, member);

  await page.goto("/ui/");
  await page.getByRole("link", { name: "Cluster" }).click();
  await page.getByRole("button", { name: "All cluster groups" }).click();
  await page.getByRole("link", { name: group }).click();
  await page.waitForSelector(`text=${member}`);

  await toggleClusterGroupMember(page, group, member);
  await deleteClusterGroup(page, group);
});

export const randomGroupName = (): string => {
  return `playwright-cluster-group-${randomNameSuffix()}`;
};

export const createClusterGroup = async (page: Page, group: string) => {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Cluster" }).click();
  await page.getByRole("button", { name: "All cluster groups" }).click();
  await page.getByRole("button", { name: "Create group" }).click();
  await page.getByPlaceholder("Enter name").click();
  await page.getByPlaceholder("Enter name").fill(group);
  await page.getByRole("button", { name: "Create" }).click();

  await page.waitForSelector(`text=Cluster group ${group} created.`);
};

export const deleteClusterGroup = async (page: Page, group: string) => {
  await page.goto("/ui/");
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
  await page.goto("/ui/");
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
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Cluster" }).click();
  const firstCellContent = await page.getByRole("cell").first().textContent();
  return firstCellContent?.split("http")[0] ?? "";
};
