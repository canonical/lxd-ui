import { test } from "@playwright/test";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
} from "./helpers/instances";
// eslint-disable-next-line prettier/prettier
import {
  closeInstancePanel,
  navigateToInstanceDetails,
  openInstancePanel,
  startInstanceFromPanel,
  stopInstanceFromPanel,
} from "./helpers/instancePanel";

test("instance panel open and close", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await openInstancePanel(page, instance);
  await closeInstancePanel(page);
  await deleteInstance(page, instance);
});

test("start and stop instance from panel", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await openInstancePanel(page, instance);
  await startInstanceFromPanel(page, instance);
  await stopInstanceFromPanel(page, instance);
  await closeInstancePanel(page);
  await deleteInstance(page, instance);
});

test("navigate to instance details from panel", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await openInstancePanel(page, instance);
  await navigateToInstanceDetails(page, instance);
  await deleteInstance(page, instance);
});
