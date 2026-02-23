import { expect, test } from "./fixtures/lxd-test";
import {
  createPool,
  deletePool,
  editPool,
  randomPoolName,
  savePool,
} from "./helpers/storagePool";
import {
  createVolume,
  deleteVolume,
  copyStorageVolume,
  editVolume,
  randomVolumeName,
  saveVolume,
  visitVolume,
  migrateVolumePool,
} from "./helpers/storageVolume";
import { activateOverride, setInput } from "./helpers/configuration";
import { randomSnapshotName } from "./helpers/snapshots";
import { assertTextVisible } from "./helpers/permissions";
import {
  createProject,
  deleteProject,
  randomProjectName,
} from "./helpers/projects";
import { gotoURL } from "./helpers/navigate";
import {
  createBucket,
  createBucketKey,
  deleteBucket,
  randomBucketName,
  visitBucket,
} from "./helpers/storageBucket";
import { cephObject } from "util/storageOptions";

let volume = randomVolumeName();

test.beforeAll(async ({ browser, browserName }) => {
  const page = await browser.newPage();
  volume = `${browserName}-${volume}`;
  await createVolume(page, volume);
  await page.close();
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  await deleteVolume(page, volume);
  await page.close();
});

test("storage pool create, edit and remove", async ({ page }) => {
  const pool = randomPoolName();
  await createPool(page, pool);

  await editPool(page, pool);
  await page.getByPlaceholder("Enter description").click();
  await page.getByPlaceholder("Enter description").fill("A-new-description");
  await savePool(page, pool);

  await page.getByTestId("tab-link-Overview").click();
  await page.waitForTimeout(1000); // Wait for the tab to change
  await assertTextVisible(page, "DescriptionA-new-description");
  await assertTextVisible(page, "StatusCreated");

  await deletePool(page, pool);
});

test("storage volume create, edit and remove", async ({ page }) => {
  await editVolume(page, volume);
  await page.getByPlaceholder("Enter value").fill("2");
  await saveVolume(page, volume);

  await page.getByTestId("tab-link-Overview").click();
  await assertTextVisible(page, "size2GiB");
});

test("storage volume migrate pool", async ({ page }) => {
  const pool2 = randomPoolName();
  await createPool(page, pool2);

  await migrateVolumePool(page, volume, pool2);
  await expect(page.getByRole("cell", { name: pool2 })).toBeVisible();

  //Migrate back to default so that the Pool can be deleted
  await migrateVolumePool(page, volume, "default");
  await deletePool(page, pool2);
});

test("storage volume edit snapshot configuration", async ({
  page,
  lxdVersion,
}) => {
  await visitVolume(page, volume);
  await page.getByTestId("tab-link-Snapshots").click();
  await page.getByText("See configuration").click();
  await page.getByRole("button", { name: "Create override" }).first().click();

  await setInput(
    page,
    "Snapshot name pattern",
    "Enter name pattern",
    "snap123",
  );
  await setInput(page, "Expire after", "Enter expiry expression", "3m");
  const scheduleFieldText =
    lxdVersion === "5.0-edge"
      ? "Schedule"
      : "Schedule Schedule for automatic volume snapshots";
  await activateOverride(page, scheduleFieldText);
  await page.getByPlaceholder("Enter cron expression").last().fill("@daily");
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForSelector(
    `text=Snapshot configuration updated for volume ${volume}.`,
  );
});

test("custom storage volume add snapshot from CTA", async ({ page }) => {
  const volume = randomVolumeName();
  await createVolume(page, volume);
  const row = page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: volume });
  await row.hover();
  await row.getByRole("button", { name: "Add Snapshot" }).click();

  const snapshot = randomSnapshotName();
  await page.getByLabel("Snapshot name").click();
  await page.getByLabel("Snapshot name").fill(snapshot);
  await page
    .getByRole("button", { name: "Create snapshot", exact: true })
    .click();
  await page.waitForSelector(
    `text=Snapshot ${snapshot} created for volume ${volume}.`,
  );

  await expect(row.getByLabel("Snapshots")).toContainText("1");

  await deleteVolume(page, volume);
});

test("navigate to custom volume via pool used by list", async ({ page }) => {
  await visitVolume(page, volume);
  await page.locator(`tr:has-text("Pool")`).getByRole("link").click();
  await page.getByRole("link", { name: volume }).click();
  await expect(page).toHaveURL(/volumes\/custom\//);
});

test("storage pool with driver zfs", async ({ page, lxdVersion }) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "ZFS driver in 5.0 is not compatible in github runners or any environment with zfs > 2.2",
  );

  const pool = randomPoolName();
  await createPool(page, pool, "ZFS");

  const poolRow = page.getByRole("row").filter({ hasText: pool });
  await expect(poolRow.getByRole("link", { name: pool })).toBeVisible();

  await deletePool(page, pool);

  await expect(page.getByRole("link", { name: pool })).toBeHidden();
});

test("storage volume of type block", async ({ page }) => {
  const volume = randomVolumeName();
  await createVolume(page, volume, "block");

  await expect(
    page
      .getByRole("row", { name: "Name" })
      .filter({ hasText: volume })
      .getByRole("cell", { name: "Content Type" }),
  ).toHaveText("Block");

  await deleteVolume(page, volume);
});

test("copy custom storage volume", async ({ page }) => {
  const project = randomProjectName();
  const pool = randomPoolName();
  await createPool(page, pool);
  await createProject(page, project);

  // Copy volume in the same project and same pool
  let duplicateVolume = await copyStorageVolume(page, volume);
  await deleteVolume(page, duplicateVolume);

  // Copy volume in the same project and different pool
  duplicateVolume = await copyStorageVolume(page, volume, pool);
  await deleteVolume(page, duplicateVolume);

  // Copy volume in a different project and same pool
  duplicateVolume = await copyStorageVolume(page, volume, undefined, project);
  await deleteVolume(page, duplicateVolume, project);

  // Copy volume in a different project and different pool
  duplicateVolume = await copyStorageVolume(page, volume, pool, project);
  await deleteVolume(page, duplicateVolume, project);

  await deletePool(page, pool);
  await deleteProject(page, project);
});

test("Export and upload a volume backup", async ({ page }) => {
  await visitVolume(page, volume);
  const downloadPromise = page.waitForEvent("download");

  await page.getByRole("button", { name: "Export" }).click();
  await page.getByRole("button", { name: "Export volume" }).click();
  const download = await downloadPromise;
  await page.waitForSelector(`text=Volume ${volume} download started`);
  const VOLUME_FILE = "tests/fixtures/volume.tar.gz";
  await download.saveAs(VOLUME_FILE);

  //Upload a volume
  const uploadVolume = randomVolumeName();
  await gotoURL(page, "/ui/");
  await page.getByText("Storage").click();
  await page.getByText("Volumes").click();
  await page.getByText("Create volume").click();
  await page.getByRole("button", { name: "Upload volume file" }).click();
  await expect(
    page
      .locator(`section:has-text("Upload volume file")`)
      .getByLabel("Storage pool", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("LXD backup archive").setInputFiles(VOLUME_FILE);
  await page.getByRole("textbox", { name: "Enter name" }).fill(uploadVolume);
  await page.getByRole("button", { name: "Upload and create" }).click();
  await page.waitForSelector(`text=Upload completed. Now creating volume`);
  await page.waitForSelector(`text=Created volume ${uploadVolume}.`);

  await deleteVolume(page, uploadVolume);
});

test("storage bucket create, edit, delete", async ({ page, lxdVersion }) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "Ceph is not configured in CI for 5.0 in github runners",
  );

  const bucket = randomBucketName();
  const pool = randomPoolName();

  await createPool(page, pool, cephObject);
  await createBucket(page, bucket);

  const row = page.getByRole("row").filter({ hasText: bucket });
  await row.hover();
  await row.getByRole("button", { name: "Edit bucket" }).click();
  await page.getByRole("spinbutton", { name: "Size" }).fill("100");
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await page.waitForSelector(`text=Storage bucket ${bucket} updated.`);

  await page.getByPlaceholder("Search and filter").fill(bucket);
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");
  await page.waitForTimeout(200);
  await expect(page.getByText("100GiB")).toBeVisible();

  await deleteBucket(page, bucket);
  await deletePool(page, pool);
});

test("storage bucket keys create, edit, delete", async ({
  page,
  lxdVersion,
}) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "Ceph is not configured in CI for 5.0 in github runners",
  );

  const bucket = randomBucketName();
  const bucketkey = `${bucket}-key`;
  const pool = randomPoolName();

  await createPool(page, pool, cephObject);
  await createBucket(page, bucket);
  await visitBucket(page, bucket);
  await createBucketKey(page, bucket, bucketkey);

  await page.getByRole("row").filter({ hasText: bucketkey }).hover();
  await page.getByRole("button", { name: "Edit bucket key" }).nth(1).click();
  await page.getByPlaceholder("Enter description").fill("Test description 2");
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await page.waitForSelector(`text=Key ${bucketkey} updated`);

  await deleteBucket(page, bucket);
  await deletePool(page, pool);
});
