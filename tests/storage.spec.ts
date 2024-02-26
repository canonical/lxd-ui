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
  editVolume,
  randomVolumeName,
  saveVolume,
  visitVolume,
} from "./helpers/storageVolume";
import { activateOverride, setInput } from "./helpers/configuration";
import { randomSnapshotName } from "./helpers/snapshots";

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
  await page.getByPlaceholder("Enter description").fill("A-new-description");
  await savePool(page, pool);

  await page.getByTestId("tab-link-Overview").click();
  await page.getByText("DescriptionA-new-description").click();
  await page.getByText("StatusCreated").click();

  await deletePool(page, pool);
});

test("storage volume create, edit and remove", async ({ page }) => {
  await editVolume(page, volume);
  await page.getByPlaceholder("Enter value").fill("2");
  await saveVolume(page, volume);

  await page.getByTestId("tab-link-Overview").click();
  await page.getByText("size2GiB").click();
});

test("storage volume edit snapshot configuration", async ({
  page,
  lxdVersion,
}) => {
  await visitVolume(page, volume);
  await page.getByTestId("tab-link-Snapshots").click();
  await page.getByText("See configuration").click();
  await page.getByText("Edit configuration").click();

  await setInput(
    page,
    "Snapshot name pattern",
    "Enter name pattern",
    "snap123",
  );
  await setInput(page, "Expire after", "Enter expiry expression", "3m");
  const scheduleFieldText =
    lxdVersion === "5.0-stable"
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
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Snapshot ${snapshot} created.`);

  await deleteVolume(page, volume);
});

test("navigate to custom volume via pool used by list", async ({ page }) => {
  await visitVolume(page, volume);
  await page.locator(`tr:has-text("Pool")`).getByRole("link").click();
  await page.getByRole("link", { name: volume }).click();
  await expect(page).toHaveURL(/volumes\/custom\//);
});
