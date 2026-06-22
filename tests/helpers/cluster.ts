import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import { expect, test } from "../fixtures/lxd-test";

export const getRemoteClusterVm = () => {
  const remoteVm = process.env.LXD_UI_CLUSTER_LINK_REMOTE_VM;
  if (!remoteVm) {
    throw new Error("Missing required env var: LXD_UI_CLUSTER_LINK_REMOTE_VM");
  }
  return remoteVm;
};

export const getLocalClusterVm = () => {
  const localVm = process.env.LXD_UI_CLUSTER_LINK_LOCAL_VM;
  if (!localVm) {
    throw new Error("Missing required env var: LXD_UI_CLUSTER_LINK_LOCAL_VM");
  }
  return localVm;
};

export const skipIfNotClustered = (projectName: string) => {
  test.skip(!isClusteredTestProject(projectName));
};

export const isClusteredTestProject = (projectName: string) => {
  return projectName.includes(":clustered");
};

export const getFirstClusterMember = async (page: Page): Promise<string> => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Members" }).click();
  await expect(
    page.getByText("Cluster members", { exact: true }),
  ).toBeVisible();
  const firstCellContent = await page
    .getByRole("rowheader")
    .first()
    .textContent();
  return firstCellContent?.split("http")[0] ?? "";
};
