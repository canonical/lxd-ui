import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import type { LxdVersions } from "../fixtures/lxd-test";
import { expect, test } from "../fixtures/lxd-test";

export const skipIfNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "Cluster tests not supported for lxd 5.0",
  );
};

export const skipIfNotClustered = (projectName: string) => {
  test.skip(!projectName.includes(":clustered"));
};

export const getFirstClusterMember = async (page: Page): Promise<string> => {
  await gotoURL(page, "/ui/");
  await page
    .getByRole("button", { name: "Clustering" })
    .click({ timeout: 5000 });
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
