import { test } from "./fixtures/lxd-test";
import { getClipPosition } from "./helpers/doc-screenshots";
import { gotoURL } from "./helpers/navigate";

test.beforeEach(() => {
  test.skip(
    !!process.env.CI && !process.env.ENABLE_SCREENSHOTS,
    "This suite is only run manually to create screenshots for the documentation",
  );
});

//Run in a clustered backend

test("Clustered storage pools", async ({ page }) => {
  //Clustered storage pool creation
  const poolName = "clustered-pool";
  await page.setViewportSize({ width: 1440, height: 1000 });
  await gotoURL(page, "/ui/");
  await page.getByText("Storage").click();
  await page.getByRole("link", { name: "Pools" }).click();
  await page.getByText("Create pool").click();
  await page.getByPlaceholder("Enter name").fill(poolName);
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_pools_create_clustered_pool.png",
    clip: getClipPosition(240, 0, 1420, 750),
  });

  //Clustered storage pool size config
  await page.getByText("Same for all cluster members").first().click();
  await page.getByPlaceholder("Enter name").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_pools_create_clustered_pool_size_config.png",
    clip: getClipPosition(490, 420, 1360, 640),
  });
});

test("LXD - UI Folder - Clustered", async ({ page }) => {
  //This test assumes that there is a cluster member named micro1 within the environment. This is the value within the original screenshot, but it can also be changed to accomodate alternative names.
  const clusterMemberName = "micro1";
  await page.setViewportSize({ width: 1440, height: 800 });
  await gotoURL(page, "/ui/");
  await page.getByRole("link", { name: "Instances", exact: true }).click();
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByPlaceholder("Enter name").fill("Ubuntu-vm-server2");
  await page.getByRole("button", { name: "Browse images" }).click();
  await page
    .locator("tr")
    .filter({ hasText: "Ubuntu24.04 LTSnoblealldefaultUbuntuRemoteSelect" })
    .getByRole("button")
    .click();
  await page.getByLabel("Cluster member").selectOption(clusterMemberName);
  await page.getByLabel("Cluster member").dblclick();
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/create_instance_ex4.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });
});
