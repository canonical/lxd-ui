import { test } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import { createPool, deletePool } from "./helpers/storagePool";

test.beforeEach(() => {
  test.skip(
    Boolean(process.env.CI),
    "This suite is only run manually to create screenshots for the documentation",
  );
});

// x,y is top left coordinate, xx,yy is bottom right coordinate
// gimp provides the coordinates of the area easily
const getClipPosition = (x: number, y: number, xx: number, yy: number) => {
  return {
    x: x,
    y: y,
    width: xx - x,
    height: yy - y,
  };
};

//Run in a clustered backend

test("clustered storage pools", async ({ page }) => {
  //Clustered storage pool creation
  const poolName = "clustered-pool";
  page.setViewportSize({ width: 1440, height: 1000 });
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

test("Clustered storage volumes", async ({ page }) => {
  const poolName = "pool1";
  const volumeName = "CustomVol1";
  page.setViewportSize({ width: 1440, height: 800 });
  await createPool(page, poolName);

  await page.getByRole("link", { name: "Volumes", exact: true }).click();
  await page.getByText("Create volume").click();
  await page.getByPlaceholder("Enter name").fill(volumeName);
  await page.getByLabel("Storage pool", { exact: true }).click();
  await page.getByLabel("submenu").getByText("pool1").click();

  // Clustered storage volume creation
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_create.png",
    clip: getClipPosition(240, 0, 1420, 750),
  });
  await deletePool(page, poolName);
});
