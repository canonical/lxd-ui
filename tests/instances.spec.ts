import { test } from "@playwright/test";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
} from "./instance-helpers";

test("instance create and remove", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await deleteInstance(page, instance);
});
