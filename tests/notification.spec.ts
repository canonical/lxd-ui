import { expect } from "@playwright/test";
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
  dismissNotification,
  checkNotificationHidden,
  toggleNotificationList,
  dismissFirstNotificationFromList,
  hoverNotificationChip,
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

test("notification chip actions reflect instance state and can freeze an instance", async ({
  page,
}) => {
  await visitAndStopInstance(page, instance);
  const startButton = page.getByRole("button", { name: "Start", exact: true });
  await expect(startButton).toBeEnabled();
  await startButton.click();
  await toggleNotificationList(page);

  const notifications = page.getByRole("list", { name: "Notifications list" });
  const tooltip = page.getByRole("tooltip").filter({ hasText: instance });

  const startedNotification = notifications.getByRole("listitem").filter({
    hasText: `Instance ${instance} started.`,
  });
  await hoverNotificationChip(startedNotification, tooltip, instance);
  await expect(tooltip.getByText("Running", { exact: true })).toBeVisible();
  await expect(
    tooltip.getByRole("button", { name: "Start", exact: true }),
  ).toBeDisabled();
  await expect(
    tooltip.getByRole("button", { name: "Restart", exact: true }),
  ).toBeEnabled();
  await expect(
    tooltip.getByRole("button", { name: "Freeze", exact: true }),
  ).toBeEnabled();
  await expect(
    tooltip.getByRole("button", { name: "Stop", exact: true }),
  ).toBeEnabled();

  await tooltip.getByRole("button", { name: "Freeze", exact: true }).click();
  const confirmation = page.getByRole("dialog", { name: "Confirm freeze" });
  await confirmation
    .getByRole("button", { name: "Freeze", exact: true })
    .click();

  const frozenNotification = notifications.getByRole("listitem").filter({
    hasText: `Instance ${instance} frozen.`,
  });
  await hoverNotificationChip(frozenNotification, tooltip, instance);
  await expect(tooltip.getByText("Frozen", { exact: true })).toBeVisible();
  await expect(
    tooltip.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  await expect(
    tooltip.getByRole("button", { name: "Restart", exact: true }),
  ).toBeDisabled();
  await expect(
    tooltip.getByRole("button", { name: "Freeze", exact: true }),
  ).toBeDisabled();
  await expect(
    tooltip.getByRole("button", { name: "Stop", exact: true }),
  ).toBeEnabled();

  await tooltip.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    page.getByRole("main").getByText("Running", { exact: true }),
  ).toBeVisible();
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
