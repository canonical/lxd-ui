import { chromium, FullConfig } from "@playwright/test";
import { INSTANCE_NAME } from "./constants";
import { deleteInstance, hasInstance } from "./instance-helpers";

async function globalTeardown(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage(config.projects[0].use);
  if (await hasInstance(page, INSTANCE_NAME)) {
    await deleteInstance(page, INSTANCE_NAME);
  }
  await browser.close();
}

export default globalTeardown;
