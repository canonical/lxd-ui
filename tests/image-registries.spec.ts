import { expect, test } from "./fixtures/lxd-test";
import {
  skipIfNotSupported,
  visitImageRegistries,
} from "./helpers/image-registries";
import { gotoURL } from "./helpers/navigate";

test("search for an image registry", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);

  await gotoURL(page, "/ui");
  await page.getByRole("button", { name: "Images" }).click();
  await page
    .getByRole("link", { name: "Image registries", exact: true })
    .click();
  await expect(page.getByTitle("Create registry")).toBeVisible();

  await page.getByPlaceholder("Search and filter").click();
  await page.getByPlaceholder("Search and filter").fill("ubuntu-daily"); //builtin image registry
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");

  await expect(
    page.getByRole("row", { name: /ubuntu-daily/i, exact: true }),
  ).toBeVisible();
});

test("search for built-in image registries", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);

  await visitImageRegistries(page);

  await page.getByPlaceholder("Search and filter").click();
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByRole("button", { name: /BUILTIN Yes/i }).click();
  await page.getByPlaceholder("Add filter").press("Escape");

  await expect(page.getByText("Showing all 5 image registries")).toBeVisible();
});
