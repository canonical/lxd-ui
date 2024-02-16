import { test } from "./fixtures/lxd-test";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
} from "./helpers/instances";
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
  await restoreInstanceSnapshot(page, snapshot);

  const newName = `${snapshot}-rename`;
  await editInstanceSnapshot(page, snapshot, newName, instance);

  await deleteInstanceSnapshot(page, newName);

  await deleteInstance(page, instance);
});

test("custom storage volume snapshot create, restore, edit and remove", async ({
  page,
}) => {
  const volume = randomVolumeName();
  await createVolume(page, volume);

  const snapshot = randomSnapshotName();
  await createStorageVolumeSnapshot(page, volume, snapshot);
  await restoreStorageVolumeSnapshot(page, snapshot);

  const newName = `${snapshot}-rename`;
  await editStorageVolumeSnapshot(page, snapshot, newName);

  await deleteStorageVolumeSnapshot(page, newName);

  await deleteVolume(page, volume);
});
