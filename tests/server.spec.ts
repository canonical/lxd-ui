import { test } from "@playwright/test";
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

test("test all non-critical server settings", async ({ page }) => {
  await visitServerSettings(page);
  for (const setting of settings) {
    await updateSetting(page, setting.name, setting.type, setting.content);
    await resetSetting(page, setting.name, setting.type, setting.default);
  }
});
