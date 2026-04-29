import { expect, test } from "./fixtures/lxd-test";
import {
  skipIfNotSupported,
  visitImageRegistries,
  visitImageRegistry,
  randomImageRegistryName,
  createImageRegistry,
  deleteImageRegistry,
  openImageRegistryEditPanel,
} from "./helpers/image-registries";
import { gotoURL } from "./helpers/navigate";
import { dismissNotification } from "./helpers/notification";
import {
  createProject,
  deleteProject,
  openProjectConfiguration,
  randomProjectName,
} from "./helpers/projects";
import { assertReadMode, activateOverride } from "./helpers/configuration";
import { visitCreateInstancePage } from "./helpers/instances";

test("search for an image registry", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);

  await gotoURL(page, "/ui");
  await page.getByRole("button", { name: "Images" }).click();
  await page
    .getByRole("link", { name: "Image registries", exact: true })
    .click();
  await expect(page.getByTitle("Create registry")).toBeVisible();

  const builtinRegistryName = "ubuntu-daily";
  await page.getByPlaceholder("Search and filter").click();
  await page.getByPlaceholder("Search and filter").fill(builtinRegistryName);
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");

  const row = page.getByRole("row").filter({ hasText: builtinRegistryName });
  await expect(row).toBeVisible();
  await expect(row.getByRole("rowheader", { name: "Name" })).toContainText(
    builtinRegistryName,
  );

  await expect(row.getByRole("cell", { name: "Protocol" })).toContainText(
    "simplestreamshttps://cloud-images.ubuntu.com/daily/",
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
  await page.getByRole("button").filter({ hasText: "BUILTINYes" }).click();
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
    page.getByRole("heading", { name: "Create image registry" }),
  ).toBeVisible();

  const sidePanel = page.getByLabel("Side panel");
  await sidePanel.getByPlaceholder("Enter name").fill(registryName);
  await sidePanel
    .getByLabel("Description")
    .fill("Playwright SimpleStreams registry");
  await sidePanel
    .getByRole("radio", { name: "SimpleStreams" })
    .check({ force: true });
  await expect(sidePanel.getByLabel("Source project")).not.toBeVisible();
  await expect(sidePanel.getByLabel("Cluster")).not.toBeVisible();
  await sidePanel.getByLabel("Server").fill(url);

  await sidePanel.getByRole("button", { name: "Create", exact: true }).click();
  await dismissNotification(page, `Image registry ${registryName} created.`);

  const createdRow = page.getByRole("row").filter({ hasText: registryName });
  await expect(
    createdRow.getByRole("rowheader", { name: "Name" }),
  ).toContainText(registryName);
  await expect(
    createdRow.getByRole("cell", { name: "Protocol" }),
  ).toContainText("simplestreamshttps://cloud-images.ubuntu.com/releases/");
  await expect(
    createdRow.getByRole("cell", { name: "Built-in" }),
  ).toContainText("No");
  await expect(createdRow.getByRole("cell", { name: "Public" })).toContainText(
    "Yes",
  );

  await deleteImageRegistry(page, registryName);
});

test("view image registry detail page", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);

  const builtinRegistryName = "ubuntu-daily";
  const url = "https://cloud-images.ubuntu.com/daily/";

  await visitImageRegistry(page, builtinRegistryName);

  await expect(
    page.getByRole("link", { name: "Images", exact: true }),
  ).toBeVisible();
  await page.getByTestId("tab-link-Configuration").click();

  const panel = page.getByRole("tabpanel", { name: "Configuration" });
  await expect(panel.locator("tr").filter({ hasText: "Name" })).toContainText(
    builtinRegistryName,
  );
  await expect(
    panel.locator("tr").filter({ hasText: "Protocol" }),
  ).toContainText("simplestreams");
  await expect(panel.locator("tr").filter({ hasText: "Server" })).toContainText(
    url,
  );
  await expect(
    panel.locator("tr").filter({ hasText: "Built-in" }),
  ).toContainText("Yes");
  await expect(panel.locator("tr").filter({ hasText: "Public" })).toContainText(
    "Yes",
  );

  await expect(
    page.getByRole("button").filter({ hasText: "Edit registry" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button").filter({ hasText: "Delete registry" }),
  ).toBeDisabled();
});

test("edit image registry", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);

  const registryName = randomImageRegistryName();
  await createImageRegistry(page, registryName, "SimpleStreams", {
    url: "https://cloud-images.ubuntu.com/releases/",
  });

  await openImageRegistryEditPanel(page, registryName);
  const updatedDescription = "Updated Playwright description";
  const sidePanel = page.getByLabel("Side panel");
  await sidePanel.getByLabel("Description").fill(updatedDescription);
  await sidePanel.getByRole("button", { name: "Save" }).click();
  await dismissNotification(page, `Image registry ${registryName} updated.`);

  await page.getByTestId("tab-link-Configuration").click();
  await expect(page.getByText(updatedDescription)).toBeVisible();

  await deleteImageRegistry(page, registryName);
});

test("delete image registry", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);

  const registryName = randomImageRegistryName();
  await createImageRegistry(page, registryName, "SimpleStreams", {
    url: "https://cloud-images.ubuntu.com/releases/",
  });
  const row = page.getByRole("row").filter({ hasText: registryName });
  await expect(row).toBeVisible();

  await deleteImageRegistry(page, registryName);
  await expect(row).not.toBeVisible();
});

test("project image registry restrictions", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);

  const project = randomProjectName();
  const registryName = randomImageRegistryName();

  await createImageRegistry(page, registryName, "SimpleStreams", {
    url: "https://cloud-images.ubuntu.com/releases/",
  });
  await createProject(page, project);
  await openProjectConfiguration(page);

  await page.getByText("Allow custom restrictions on a project level").click();

  await page
    .getByRole("navigation", { name: "Project form navigation" })
    .getByText("Images")
    .click();

  await activateOverride(page, "Available image registries");

  await page
    .getByRole("row")
    .filter({ hasText: "Available image registries" })
    .getByLabel("Select registries")
    .click();

  await page.getByRole("button", { name: "Clear", exact: true }).click();

  await page.getByRole("button", { name: /^Save \d+ changes?$/ }).click();
  await dismissNotification(page, `Project ${project} updated.`);

  await page
    .getByRole("navigation", { name: "Project form navigation" })
    .getByText("Images")
    .click();
  await assertReadMode(page, "Available image registries", "");

  await visitCreateInstancePage(page, project);
  await page.getByRole("button", { name: "Browse images" }).click();
  await expect(page.getByText("No matching images found")).toBeVisible();

  await deleteProject(page, project);
  await deleteImageRegistry(page, registryName);
});
