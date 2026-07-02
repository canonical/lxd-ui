import { test, expect } from "./fixtures/lxd-test";
import { skipIfClusteringNotSupported } from "./helpers/cluster-groups";
import { gotoURL } from "./helpers/navigate";

test("check enabling clustering", async ({ page, lxdVersion }, testInfo) => {
  skipIfClusteringNotSupported(lxdVersion);
  test.skip(!testInfo.project.name.includes("enable-clustering"));

  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Server" }).click();
  await expect(page.getByText("Server", { exact: true })).toBeVisible();
  await expect(page.getByText("System")).toBeVisible();
  await page.getByRole("button", { name: "Enable clustering" }).click();
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("link", { name: "Groups" }).click();
  await expect(page.getByText("Cluster groups", { exact: true })).toBeVisible();
  await expect(
    page.getByText("This server is not clustered", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "To organize your servers into groups, you first need to enable clustering.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Enable clustering" }).click();
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("link", { name: "Links" }).click();
  await expect(page.getByText("Cluster links", { exact: true })).toBeVisible();
  await expect(
    page.getByText("This server is not clustered", { exact: true }),
  ).not.toBeVisible();

  await page.getByRole("link", { name: "Placement" }).click();
  await expect(
    page.getByText("Placement groups", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("This server is not clustered", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "To manage placement groups, you first need to enable clustering.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Enable clustering" }).click();
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("link", { name: "Replicators" }).click();
  await expect(page.getByText("Replicators", { exact: true })).toBeVisible();
  await expect(
    page.getByText("This server is not clustered", { exact: true }),
  ).not.toBeVisible();

  await page.getByRole("link", { name: "Server" }).click();
  await page.getByRole("button", { name: "Enable clustering" }).click();
  await page.getByLabel("Server name").fill("micro1");
  await page.getByLabel("Cluster address").fill("127.0.0.1");
  await page.getByRole("button", { name: "Enable clustering" }).nth(1).click();
  await page.getByText("Clustering enabled").waitFor();
});
