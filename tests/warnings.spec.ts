import { test } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import { assertTextVisible } from "./helpers/permissions";

test("view warnings page", async ({ page }) => {
  await gotoURL(page, "/ui/");
  await page.getByTitle("Warnings").click();
  await assertTextVisible(page, "Last message");
});
