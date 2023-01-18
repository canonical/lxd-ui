import { chromium, FullConfig } from "@playwright/test";
import { createInstance } from "./instances.spec";
import { INSTANCE_NAME } from "./constants";

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage(config.projects[0].use);
  await page.goto("/ui/instances");
  const hasTestInstance = await page
    .getByRole("link", { name: INSTANCE_NAME })
    .first()
    .isVisible();
  if (!hasTestInstance) {
    await createInstance(page, INSTANCE_NAME);
  }
  await browser.close();
}

export default globalSetup;
