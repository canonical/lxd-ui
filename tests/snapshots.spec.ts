import { test } from "@playwright/test";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
} from "./helpers/instances";
import {
  createSnapshot,
  deleteSnapshot,
  editSnapshot,
  randomSnapshotName,
  restoreSnapshot,
} from "./helpers/snapshots";

test("snapshot create, restore, edit and remove", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);

  const snapshot = randomSnapshotName();
  await createSnapshot(page, instance, snapshot);
  await restoreSnapshot(page, snapshot);

  const newName = `${snapshot}-rename`;
  await editSnapshot(page, snapshot, newName);

  await deleteSnapshot(page, newName);

  await deleteInstance(page, instance);
});
