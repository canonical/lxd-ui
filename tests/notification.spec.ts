import { test, expect } from "@playwright/test";
import {
  createAndStartInstance,
  createInstance,
  deleteInstance,
  randomInstanceName,
} from "./helpers/instances";
import {
  checkNotificationExists,
  dismissNotification,
  checkNotificationHidden,
  toggleNotificationList,
  dismissFirstNotificationFromList,
} from "./helpers/notification";

test("show notification after user action", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await checkNotificationExists(page);
  await deleteInstance(page, instance);
  await checkNotificationExists(page);
});

test("dismiss one notification", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await dismissNotification(page);
  await deleteInstance(page, instance);
  await dismissNotification(page);
});

test("auto hide notification after a timeout", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await page.waitForTimeout(5000);
  await checkNotificationHidden(page);
  await deleteInstance(page, instance);
  await dismissNotification(page);
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
