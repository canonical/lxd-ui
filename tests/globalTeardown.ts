import { chromium, FullConfig } from "@playwright/test";
import { deleteInstance } from "./instances.spec";
import { INSTANCE_NAME } from "./constants";

async function globalTeardown(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage(config.projects[0].use);
  await page.goto("/ui/instances");
  const hasTestInstance = await page
    .getByRole("link", { name: INSTANCE_NAME })
    .first()
    .isVisible();
  if (hasTestInstance) {
    await deleteInstance(page, INSTANCE_NAME);
  }
  await browser.close();
}

export default globalTeardown;
