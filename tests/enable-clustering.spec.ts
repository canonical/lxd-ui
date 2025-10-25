import { test, expect } from "./fixtures/lxd-test";
import { skipIfNotSupported } from "./helpers/cluster";
import { gotoURL } from "./helpers/navigate";

test("check enabling clustering", async ({ page, lxdVersion }, testInfo) => {
  skipIfNotSupported(lxdVersion);
  test.skip(!testInfo.project.name.includes("enable-clustering"));

  await gotoURL(page, "/ui/");
  await page.getByText("Server", { exact: true }).click();
  await page.getByTestId("tab-link-Clustering").click();
  await expect(page.getByText("This server is not clustered")).toBeVisible();
  await page.getByRole("button", { name: "Enable clustering" }).click();
  await page.getByLabel("Server name").fill("micro1");
  await page.getByLabel("Cluster address").fill("127.0.0.1");
  await page.getByRole("button", { name: "Enable clustering" }).nth(1).click();
  await page.waitForSelector(`text=Clustering enabled`);
});
