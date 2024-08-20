import { test } from "./fixtures/lxd-test";
import { deleteAllImages } from "./helpers/images";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
  visitInstance,
} from "./helpers/instances";

test("Publish an image from an instance", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);

  await page.goto("/ui/");
  await visitInstance(page, instance);
  await page.getByRole("button", { name: "Create image" }).click();
  await page
    .getByRole("dialog", { name: "Create image from instance" })
    .getByRole("button", { name: "Create image" })
    .click();

  await page.waitForSelector(`text=Image created from instance ${instance}.`);

  await deleteAllImages(page);
  await deleteInstance(page, instance);
});
