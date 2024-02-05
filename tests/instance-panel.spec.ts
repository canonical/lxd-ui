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
import { finishCoverage, startCoverage } from "./fixtures/coverage";

let instance = randomInstanceName();

test.beforeAll(async ({ browserName, browser, hasCoverage }) => {
  instance = `${browserName}-${instance}`;
  const page = await browser.newPage();
  await startCoverage(page, hasCoverage);
  await createInstance(page, instance);
  await finishCoverage(page, hasCoverage);
  await page.close();
});

test.afterAll(async ({ browser, hasCoverage }) => {
  const page = await browser.newPage();
  await startCoverage(page, hasCoverage);
  await deleteInstance(page, instance);
  await finishCoverage(page, hasCoverage);
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
