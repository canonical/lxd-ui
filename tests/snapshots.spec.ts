import { test } from "./fixtures/lxd-test";
import { deleteAllImages } from "./helpers/images";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
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
} from "./helpers/storageVolume";

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
  const type = "container";
  await createInstance(page, instance, type, project);

  const snapshot = randomSnapshotName();
  await createInstanceSnapshot(page, instance, snapshot, project);
  await createImageFromSnapshot(page, snapshot);

  await deleteInstance(page, instance, project);
  await deleteAllImages(page, project);
  await deleteProject(page, project);
});
