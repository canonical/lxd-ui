import { Page, test } from "@playwright/test";
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

let instance = randomInstanceName();
let page: Page;
test.beforeAll(async ({ browser, browserName }) => {
  instance = `${browserName}-${instance}`;
  page = await browser.newPage();
  await createInstance(page, instance);
});

test.afterAll(async () => {
  await deleteInstance(page, instance);
  await page.close();
});

test("instance panel open and close", async () => {
  await openInstancePanel(page, instance);
  await closeInstancePanel(page);
});

test("start and stop instance from panel", async () => {
  await openInstancePanel(page, instance);
  await startInstanceFromPanel(page, instance);
  await stopInstanceFromPanel(page, instance);
  await closeInstancePanel(page);
});

test("navigate to instance details from panel", async () => {
  await openInstancePanel(page, instance);
  await navigateToInstanceDetails(page, instance);
});
