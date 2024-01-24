import { test } from "@playwright/test";
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
import { TIMEOUT } from "./helpers/constants";
import { randomSnapshotName } from "./helpers/snapshots";

test("storage pool create, edit and remove", async ({ page }) => {
  const pool = randomPoolName();
  await createPool(page, pool);

  await editPool(page, pool);
  await page.getByPlaceholder("Enter description").fill("A-new-description");
  await savePool(page);

  await page.getByTestId("tab-link-Overview").click();
  await page.getByText("DescriptionA-new-description").click();
  await page.getByText("StatusCreated").click();

  await deletePool(page, pool);
});

test("storage volume create, edit and remove", async ({ page }) => {
  const volume = randomVolumeName();
  await createVolume(page, volume);

  await editVolume(page, volume);
  await page.getByPlaceholder("Enter value").fill("2");
  await saveVolume(page);

  await page.getByTestId("tab-link-Overview").click();
  await page.getByText("size2GiB").click();

  await deleteVolume(page, volume);
});

test("storage volume edit snapshot configuration", async ({ page }) => {
  const volume = randomVolumeName();
  await createVolume(page, volume);
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
  await activateOverride(page, "Schedule Schedule for automatic");
  await page.getByPlaceholder("Enter cron expression").last().fill("@daily");
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForSelector(`text=Configuration updated.`, TIMEOUT);

  await deleteVolume(page, volume);
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
  await page.waitForSelector(`text=Snapshot ${snapshot} created.`, TIMEOUT);

  await deleteVolume(page, volume);
});
