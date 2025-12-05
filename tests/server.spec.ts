import { test, expect } from "./fixtures/lxd-test";
import { dismissNotification } from "./helpers/notification";
import type { ServerSettingType } from "./helpers/server";
import {
  addUserSetting,
  deleteUserSetting,
  randomSettingKey,
  randomSettingValue,
  resetSetting,
  updateSetting,
  visitServerSettings,
} from "./helpers/server";

const settings: {
  name: string;
  type: ServerSettingType;
  default: string;
  content: string;
}[] = [
  {
    name: "acme.agree_tos",
    type: "checkbox",
    content: "true",
    default: "false",
  },
  {
    name: "acme.ca_url",
    type: "text",
    content: "https://acme-v02.api.letsencrypt.org/directory/test",
    default: "https://acme-v02.api.letsencrypt.org/directory",
  },
  {
    name: "loki.auth.password",
    type: "password",
    content: "abc",
    default: "-",
  },
];

test("test all non-critical server settings", async ({ page, lxdVersion }) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "/1.0/metadata/configuration endpoint not available in lxd v5.0/edge",
  );
  await visitServerSettings(page);
  for (const setting of settings) {
    await updateSetting(page, setting.name, setting.type, setting.content);
    await resetSetting(page, setting.name, setting.type, setting.default);
  }
});

test("only user server setting available for lxd v5.0/edge", async ({
  page,
  lxdVersion,
}) => {
  test.skip(
    lxdVersion !== "5.0-edge",
    `this test is specific to lxd v5.0/edge, current lxd snap channel is ${lxdVersion}`,
  );

  await visitServerSettings(page);
  await page.waitForSelector(`text=Get more server settings`);
  const allSettingRows = await page.locator("#settings-table tbody tr").all();

  // only 4 user settings available (user.ui_title, user.ui_grafana_base_url, user.ui_theme, user.ui_current_project) + 1 "Add key" button.
  expect(allSettingRows.length).toEqual(5);
});

test("add and delete user defined setting", async ({ page }) => {
  const key = randomSettingKey();
  const value = randomSettingValue();

  await visitServerSettings(page);
  await addUserSetting(page, key, value);

  await page.getByText(`Setting user.${key} added`).click();
  await dismissNotification(page);

  const keyElement = page.getByText(`user.${key}`);
  await keyElement.click();

  const valueElement = page.getByText(value);
  await expect(valueElement).toHaveCount(1);

  await deleteUserSetting(page, value);
  await expect(keyElement).toHaveCount(0);
  await expect(valueElement).toHaveCount(0);
});
