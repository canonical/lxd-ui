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
} from "./helpers/storageVolume";

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
