import { test, expect } from "./fixtures/lxd-test";
import {
  ServerSettingType,
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
    lxdVersion === "5.0-stable",
    "/1.0/metadata/configuration endpoint not available in lxd v5.0/stable",
  );
  await visitServerSettings(page);
  for (const setting of settings) {
    await updateSetting(page, setting.name, setting.type, setting.content);
    await resetSetting(page, setting.name, setting.type, setting.default);
  }
});

test("only user server setting available for lxd v5.0/stable", async ({
  page,
  lxdVersion,
}) => {
  test.skip(
    lxdVersion !== "5.0-stable",
    `this test is specific to lxd v5.0/stable, current lxd snap channel is ${lxdVersion}`,
  );

  await visitServerSettings(page);
  await page.waitForSelector(`text=Get more server settings`);
  const allSettingRows = await page.locator("#settings-table tbody tr").all();
  expect(allSettingRows.length).toEqual(1);
});
