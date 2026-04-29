import { expect } from "@playwright/test";
import { test } from "./fixtures/lxd-test";
import {
  createAndStartInstance,
  createInstance,
  deleteInstance,
  randomInstanceName,
  visitAndStartInstance,
} from "./helpers/instances";
import {
  dismissNotification,
  checkNotificationHidden,
  toggleNotificationList,
  dismissFirstNotificationFromList,
} from "./helpers/notification";

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

test("show notification after user action", async ({ page }) => {
  await visitAndStartInstance(page, instance);
  const stopButton = page.getByRole("button", { name: "Stop", exact: true });
  await page.keyboard.down("Shift");
  await stopButton.click();
  await page.keyboard.up("Shift");
  await dismissNotification(page, `Instance ${instance} stopped.`);
  const startButton = page.getByRole("button", { name: "Start", exact: true });
  await page.keyboard.down("Shift");
  await startButton.click();
  await page.keyboard.up("Shift");
  await page.waitForTimeout(5000);
  await checkNotificationHidden(page);
});

test("notifications list", async ({ page }) => {
  const instance = randomInstanceName();
  await createAndStartInstance(page, instance);
  await toggleNotificationList(page); // open list

  // check there are multiple notifications
  const notificationsList = page.getByRole("list", {
    name: "Notifications list",
  });
  const notifications = await notificationsList.getByRole("listitem").all();
  expect(notifications.length).toBeGreaterThan(1);

  // set and clear filters
  const notificationsLocator = notificationsList.getByRole("listitem");
  const countBeforeFilter = (await notificationsLocator.all()).length;
  await notificationsList.locator(".filter-button").first().click();
  const countAfterFilter = (await notificationsLocator.all()).length;
  expect(countAfterFilter).toBeLessThan(countBeforeFilter);
  await notificationsList
    .getByRole("button", { name: "Clear filters" })
    .click();
  const countAfterClearFilter = (await notificationsLocator.all()).length;
  expect(countAfterClearFilter).toEqual(countBeforeFilter);

  // dismiss one notification from list
  await dismissFirstNotificationFromList(page);

  // dismiss all notifications from list
  await notificationsList.getByRole("button", { name: "Dismiss all" }).click();
  await expect(notificationsList).toBeHidden();

  await deleteInstance(page, instance);
});
