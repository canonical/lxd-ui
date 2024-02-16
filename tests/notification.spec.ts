import { expect, Page } from "@playwright/test";
import { test } from "./fixtures/lxd-test";
import {
  createAndStartInstance,
  createInstance,
  deleteInstance,
  randomInstanceName,
  visitAndStartInstance,
  visitAndStopInstance,
} from "./helpers/instances";
import {
  checkNotificationExists,
  dismissNotification,
  checkNotificationHidden,
  toggleNotificationList,
  dismissFirstNotificationFromList,
} from "./helpers/notification";

let instance = randomInstanceName();
let page: Page;
test.beforeAll(async ({ browserName, browser }) => {
  page = await browser.newPage();
  instance = `${browserName}-${instance}`;
  await createInstance(page, instance);
});

test.afterAll(async () => {
  await deleteInstance(page, instance);
  await page.close();
});

test("show notification after user action", async () => {
  await visitAndStartInstance(page, instance);
  await checkNotificationExists(page);
});

test("dismiss one notification", async () => {
  await visitAndStopInstance(page, instance);
  await dismissNotification(page);
});

test("auto hide notification after a timeout", async () => {
  await visitAndStartInstance(page, instance);
  await page.waitForTimeout(5000);
  await checkNotificationHidden(page);
});

test("notifications list", async () => {
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
