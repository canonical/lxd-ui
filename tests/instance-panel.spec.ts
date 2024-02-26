import { test } from "./fixtures/lxd-test";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
} from "./helpers/instances";
import {
  closeInstancePanel,
  navigateToInstanceDetails,
  openInstancePanel,
  startInstanceFromPanel,
  stopInstanceFromPanel,
} from "./helpers/instancePanel";

let instance = randomInstanceName();

test.beforeAll(async ({ browserName, browser }) => {
  instance = `${browserName}-${instance}`;
  const page = await browser.newPage();
  await createInstance(page, instance);
  await page.close();
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  await deleteInstance(page, instance);
  await page.close();
});

test("instance panel open and close", async ({ page }) => {
  await openInstancePanel(page, instance);
  await closeInstancePanel(page);
});

test("start and stop instance from panel", async ({ page }) => {
  await openInstancePanel(page, instance);
  await startInstanceFromPanel(page, instance);
  await stopInstanceFromPanel(page, instance);
  await closeInstancePanel(page);
});

test("navigate to instance details from panel", async ({ page }) => {
  await openInstancePanel(page, instance);
  await navigateToInstanceDetails(page, instance);
});
