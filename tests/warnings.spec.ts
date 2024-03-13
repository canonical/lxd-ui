import { test } from "./fixtures/lxd-test";

test("view warnings page", async ({ page }) => {
  await page.goto("/ui/");
  await page.getByTitle("Warnings").click();
  await page.getByText("Last message").click();
});
