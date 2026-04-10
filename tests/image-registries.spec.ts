import { expect, test } from "./fixtures/lxd-test";
import {
  skipIfNotSupported,
  visitImageRegistries,
  randomImageRegistryName,
} from "./helpers/image-registries";
import { gotoURL } from "./helpers/navigate";

test("search for an image registry", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const builtinRegistryName = "ubuntu-daily";

  await gotoURL(page, "/ui");
  await page.getByRole("button", { name: "Images" }).click();
  await page
    .getByRole("link", { name: "Image registries", exact: true })
    .click();
  await expect(page.getByTitle("Create registry")).toBeVisible();

  await page.getByPlaceholder("Search and filter").click();
  await page.getByPlaceholder("Search and filter").fill(builtinRegistryName);
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");

  const row = page.getByRole("row", {
    name: builtinRegistryName,
    exact: true,
  });
  await expect(row).toBeVisible();
  await expect(row.getByRole("cell", { name: "Name" })).toContainText(
    builtinRegistryName,
  );
  await expect(row.getByRole("cell", { name: "Protocol" })).toContainText(
    "simplestreams",
  );
  await expect(row.getByRole("cell", { name: "Built-in" })).toContainText(
    "Yes",
  );
  await expect(row.getByRole("cell", { name: "Public" })).toContainText("Yes");
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

test("create SimpleStreams image registry", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const registryName = randomImageRegistryName();
  const url = "https://cloud-images.ubuntu.com/releases/";
  await visitImageRegistries(page);
  await page.getByTitle("Create registry").click();
  await expect(
    page.getByRole("heading", { name: "Create registry" }),
  ).toBeVisible();

  await page.getByLabel("Name").fill(registryName);
  await page
    .getByLabel("Description")
    .fill("Playwright SimpleStreams registry");
  await page
    .getByLabel("Protocol")
    .getByRole("radio", { name: "SimpleStreams" })
    .check();
  await expect(page.getByLabel("Source project")).not.toBeVisible();
  await expect(page.getByLabel("Cluster link")).not.toBeVisible();
  await page.getByLabel("Server URL").fill(url);

  await page.getByRole("button", { name: "Create" }).click();

  await expect(
    page.getByText(`Image registry ${registryName} created.`),
  ).toBeVisible();

  const createdRow = page.getByRole("row", { name: registryName, exact: true });
  await expect(createdRow.getByRole("cell", { name: "Name" })).toContainText(
    registryName,
  );
  await expect(
    createdRow.getByRole("cell", { name: "Protocol" }),
  ).toContainText("simplestreams");
  await expect(
    createdRow.getByRole("cell", { name: "Built-in" }),
  ).toContainText("No");
  await expect(createdRow.getByRole("cell", { name: "Public" })).toContainText(
    "Yes",
  );
});
