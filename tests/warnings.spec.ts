import { test } from "./fixtures/lxd-test";
import { assertTextVisible } from "./helpers/permissions";

test("view warnings page", async ({ page }) => {
  await page.goto("/ui/");
  await page.getByTitle("Warnings").click();
  await assertTextVisible(page, "Last message");
});
