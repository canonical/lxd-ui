import { Page, expect } from "@playwright/test";

export const checkNotificationExists = async (page: Page) => {
  const notification = page.locator(".toast-notification");
  await expect(notification).toBeVisible();
};

export const checkNotificationHidden = async (page: Page) => {
  const notification = page.locator(".toast-notification");
  await expect(notification).toBeHidden();
};

export const dismissNotification = async (page: Page) => {
  const notification = page.locator(".toast-notification");
  await notification
    .getByRole("button", { name: "Close notification" })
    .click();
  await expect(notification).toBeHidden();
};

export const toggleNotificationList = async (page: Page) => {
  const listToggleButton = page.getByRole("button", {
    name: "Expand notifications list",
  });
  await listToggleButton.click();
};

export const dismissFirstNotificationFromList = async (page: Page) => {
  const notificationsList = page.getByRole("list", {
    name: "Notifications list",
  });
  const notificationsLocator = notificationsList.getByRole("listitem");
  const countBeforeDismissal = (await notificationsLocator.all()).length;
  await notificationsLocator
    .first()
    .getByRole("button", { name: "Close notification" })
    .click();
  await page.waitForTimeout(500); // allow animation to finish
  const countAfterDismissal = (await notificationsLocator.all()).length;
  expect(countAfterDismissal).toBeLessThan(countBeforeDismissal);
};
