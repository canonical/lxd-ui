import { expect, test } from "./fixtures/lxd-test";
import {
  skipIfNotSupported,
  visitImageRegistries,
  visitImageRegistry,
  randomImageRegistryName,
  createImageRegistry,
  deleteImageRegistry,
  openImageRegistryEditPanel,
  validateRegistryRow,
  validateRegistryDetailRow,
} from "./helpers/image-registries";
import { gotoURL } from "./helpers/navigate";
import { dismissNotification } from "./helpers/notification";
import {
  createProject,
  deleteProject,
  openProjectConfiguration,
  randomProjectName,
} from "./helpers/projects";
import { visitCreateInstancePage } from "./helpers/instances";

const BUILTIN_IMAGE_REGISTRY = "ubuntu-daily";
const BUILTIN_IMAGE_REGISTRY_URL = "https://cloud-images.ubuntu.com/daily/";

test("search for an image registry", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);

  await gotoURL(page, "/ui");
  await page.getByRole("button", { name: "Images" }).click();
  await page
    .getByRole("link", { name: "Image registries", exact: true })
    .click();
  await expect(page.getByText("Create registry")).toBeVisible();

  await page.getByPlaceholder("Search and filter").click();
  await page.getByPlaceholder("Search and filter").fill(BUILTIN_IMAGE_REGISTRY);
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");

  await validateRegistryRow(
    page,
    BUILTIN_IMAGE_REGISTRY,
    "Protocol",
    `simplestreams${BUILTIN_IMAGE_REGISTRY_URL}`,
  );
  await validateRegistryRow(page, BUILTIN_IMAGE_REGISTRY, "Built-in", "Yes");
  await validateRegistryRow(page, BUILTIN_IMAGE_REGISTRY, "Public", "Yes");
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

test("create, edit, and delete SimpleStreams image registry", async ({
  page,
  lxdVersion,
}) => {
  skipIfNotSupported(lxdVersion);

  const registryName = randomImageRegistryName();
  await createImageRegistry(page, registryName, "SimpleStreams", {
    url: BUILTIN_IMAGE_REGISTRY_URL,
  });
  const createdRow = page.getByRole("row").filter({ hasText: registryName });

  await validateRegistryRow(
    page,
    registryName,
    "Protocol",
    `simplestreams${BUILTIN_IMAGE_REGISTRY_URL}`,
  );
  await validateRegistryRow(page, registryName, "Built-in", "No");
  await validateRegistryRow(page, registryName, "Public", "Yes");

  await openImageRegistryEditPanel(page, registryName);
  const updatedDescription = "Updated Playwright description";
  const sidePanel = page.getByLabel("Side panel");
  await sidePanel.getByLabel("Description").fill(updatedDescription);
  await sidePanel.getByRole("button", { name: "Save" }).click();
  await dismissNotification(page, `Image registry ${registryName} updated.`);

  await page.getByTestId("tab-link-Configuration").click();
  await expect(page.getByText(updatedDescription)).toBeVisible();

  await deleteImageRegistry(page, registryName);
  await expect(createdRow).not.toBeVisible();
});

test("view image registry detail page", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  await visitImageRegistry(page, BUILTIN_IMAGE_REGISTRY);

  await expect(
    page.getByRole("link", { name: "Images", exact: true }),
  ).toBeVisible();
  await page.getByTestId("tab-link-Configuration").click();

  await validateRegistryDetailRow(page, "Name", BUILTIN_IMAGE_REGISTRY);
  await validateRegistryDetailRow(page, "Protocol", "simplestreams");
  await validateRegistryDetailRow(page, "Built-in", "Yes");
  await validateRegistryDetailRow(page, "Public", "Yes");

  await expect(
    page.getByRole("button").filter({ hasText: "Edit registry" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button").filter({ hasText: "Delete registry" }),
  ).toBeDisabled();
});

test("project image registry restrictions", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);

  const project = randomProjectName();
  const registryName = randomImageRegistryName();

  await createImageRegistry(page, registryName, "SimpleStreams", {
    url: BUILTIN_IMAGE_REGISTRY_URL,
  });
  await createProject(page, project);
  await openProjectConfiguration(page);

  await page.getByText("Allow custom restrictions on a project level").click();

  await page
    .getByRole("navigation", { name: "Project form navigation" })
    .getByText("Images")
    .click();

  // No image registry is allowed for use in the project by default.
  await visitCreateInstancePage(page, project);
  await page.getByRole("button", { name: "Browse images" }).click();
  await expect(page.getByText("No matching images found")).toBeVisible();

  await deleteProject(page, project);
  await deleteImageRegistry(page, registryName);
});
