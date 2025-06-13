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
  migrateVolume,
  randomVolumeName,
  saveVolume,
  visitVolume,
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

test("storage volume migrate", async ({ page }) => {
  const pool2 = randomPoolName();
  await createPool(page, pool2);

  await migrateVolume(page, volume, pool2);
  await expect(page.getByRole("cell", { name: pool2 })).toBeVisible();

  //Migrate back to default so that the Pool can be deleted
  await migrateVolume(page, volume, "default");
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
  await page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: volume })
    .hover();
  await page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: volume })
    .getByRole("button", { name: "Add Snapshot" })
    .click();

  const snapshot = randomSnapshotName();
  await page.getByLabel("Snapshot name").click();
  await page.getByLabel("Snapshot name").fill(snapshot);
  await page
    .getByRole("button", { name: "Create snapshot", exact: true })
    .click();
  await page.waitForSelector(
    `text=Snapshot ${snapshot} created for volume ${volume}.`,
  );

  await deleteVolume(page, volume);
});

test("navigate to custom volume via pool used by list", async ({ page }) => {
  await visitVolume(page, volume);
  await page.locator(`tr:has-text("Pool")`).getByRole("link").click();
  await page.getByRole("link", { name: volume }).click();
  await expect(page).toHaveURL(/volumes\/custom\//);
});

test("storage pool with driver zfs", async ({ page }) => {
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
