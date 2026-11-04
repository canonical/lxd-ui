import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures/lxd-test";
import { deleteAllImages } from "./helpers/images";
import {
  createInstance,
  deleteInstance,
  editInstance,
  randomInstanceName,
  saveInstance,
  visitInstance,
} from "./helpers/instances";
import {
  createCustomProject,
  deleteProject,
  randomProjectName,
} from "./helpers/projects";
import {
  createInstanceSnapshot,
  deleteInstanceSnapshot,
  editInstanceSnapshot,
  randomSnapshotName,
  restoreInstanceSnapshot,
  createStorageVolumeSnapshot,
  restoreStorageVolumeSnapshot,
  editStorageVolumeSnapshot,
  deleteStorageVolumeSnapshot,
  createImageFromSnapshot,
} from "./helpers/snapshots";
import {
  createVolume,
  deleteVolume,
  randomVolumeName,
  visitVolume,
} from "./helpers/storageVolume";
import { attachVolume } from "./helpers/devices";
import { dismissNotification } from "./helpers/notification";

test("instance snapshot create, restore, edit and remove", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);

  const snapshot = randomSnapshotName();
  await createInstanceSnapshot(page, instance, snapshot);
  await restoreInstanceSnapshot(page, instance, snapshot);

  const newName = `${snapshot}-rename`;
  await editInstanceSnapshot(page, snapshot, newName, instance);

  await deleteInstanceSnapshot(page, instance, newName);

  await deleteInstance(page, instance);
});

const expectVolumeSnapshot = async (
  page: Page,
  volume: string,
  isPresent: boolean,
) => {
  await visitVolume(page, volume);
  await page.getByTestId("tab-link-Snapshots").click();
  const emptyState = page.getByText("No snapshots found");
  if (isPresent) {
    await expect(page.getByText("snap0", { exact: true })).toBeVisible();
    await expect(emptyState).toBeHidden();
  } else {
    await expect(emptyState).toBeVisible();
  }
};

const openInstanceSnapshotAction = async (
  page: Page,
  instance: string,
  snapshot: string,
  action: "Restore" | "Delete",
) => {
  await visitInstance(page, instance);
  await page.getByTestId("tab-link-Snapshots").click();
  const row = page.getByRole("row", { name: "Name" }).filter({
    hasText: snapshot,
  });
  await row.hover();
  await row.getByRole("button", { name: action }).click();
};

test("instance snapshot with custom disk devices create, restore and remove", async ({
  page,
}) => {
  const instance = randomInstanceName();
  const volume = randomVolumeName();
  await createInstance(page, instance);
  await editInstance(page, instance);
  await page.getByText("Disk", { exact: true }).click();
  await attachVolume(page, volume, "/data");
  await saveInstance(page, instance, 1);

  const snapshot = randomSnapshotName();
  await page.getByTestId("tab-link-Snapshots").click();
  await page.getByRole("button", { name: "Create snapshot" }).first().click();
  const createDialog = page.getByRole("dialog", { name: "Create snapshot" });
  await createDialog.getByLabel("Snapshot name").fill(snapshot);
  await expect(
    createDialog.getByRole("checkbox", {
      name: "Snapshot custom disk devices attached to this instance",
    }),
  ).toBeChecked();
  await createDialog.getByRole("button", { name: "Create snapshot" }).click();
  await dismissNotification(
    page,
    `Snapshot ${snapshot} created for instance ${instance} and its exclusively attached custom disk devices.`,
  );
  await expectVolumeSnapshot(page, volume, true);

  await openInstanceSnapshotAction(page, instance, snapshot, "Restore");
  const restoreDialog = page.getByRole("dialog", { name: "Confirm restore" });
  await expect(
    restoreDialog.getByRole("checkbox", {
      name: "Restore custom disk devices attached to this instance",
    }),
  ).toBeChecked();
  await restoreDialog.getByRole("button", { name: "Restore" }).click();
  await dismissNotification(
    page,
    `Snapshot ${snapshot} restored for instance ${instance} and its exclusively attached custom disk devices.`,
  );

  await openInstanceSnapshotAction(page, instance, snapshot, "Delete");
  const deleteDialog = page.getByRole("dialog", { name: "Confirm delete" });
  await expect(
    deleteDialog.getByRole("checkbox", {
      name: "Delete snapshots for custom disk devices attached to this instance",
    }),
  ).toBeChecked();
  await deleteDialog.getByRole("button", { name: "Delete snapshot" }).click();
  await dismissNotification(
    page,
    `Snapshot ${snapshot} deleted for instance ${instance} and its exclusively attached custom disk devices.`,
  );
  await expectVolumeSnapshot(page, volume, false);

  await deleteInstance(page, instance);
  await deleteVolume(page, volume);
});

test("custom storage volume snapshot create, restore, edit and remove", async ({
  page,
}) => {
  const volume = randomVolumeName();
  await createVolume(page, volume);

  const snapshot = randomSnapshotName();
  await createStorageVolumeSnapshot(page, volume, snapshot);
  await restoreStorageVolumeSnapshot(page, volume, snapshot);

  const newName = `${snapshot}-rename`;
  await editStorageVolumeSnapshot(page, snapshot, newName);

  await deleteStorageVolumeSnapshot(page, volume, newName);

  await deleteVolume(page, volume);
});

test("publish image from instance snapshot in custom project", async ({
  page,
}) => {
  const project = randomProjectName();
  await createCustomProject(page, project);

  const instance = randomInstanceName();
  await createInstance(page, instance, "container", project);

  const snapshot = randomSnapshotName();
  await createInstanceSnapshot(page, instance, snapshot, project);
  await createImageFromSnapshot(page, snapshot);

  await deleteInstance(page, instance, project);
  await deleteAllImages(page, project);
  await deleteProject(page, project);
});
