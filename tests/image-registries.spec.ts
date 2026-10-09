import { expect, test } from "./fixtures/lxd-test";
import {
  skipIfImageRegistriesNotSupported,
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
import { activateOverride, assertReadMode } from "./helpers/configuration";

const BUILTIN_IMAGE_REGISTRY = "ubuntu-daily";
const BUILTIN_IMAGE_REGISTRY_URL = "https://cloud-images.ubuntu.com/daily/";

test("search for an image registry", async ({ page, lxdVersion }) => {
  skipIfImageRegistriesNotSupported(lxdVersion);

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
  skipIfImageRegistriesNotSupported(lxdVersion);

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
  skipIfImageRegistriesNotSupported(lxdVersion);

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
  skipIfImageRegistriesNotSupported(lxdVersion);
  await visitImageRegistry(page, BUILTIN_IMAGE_REGISTRY);

  await expect(
    page.getByRole("tab", { name: "Images", exact: true }),
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
  skipIfImageRegistriesNotSupported(lxdVersion);

  const project = randomProjectName();
  const registryName = randomImageRegistryName();

  await createImageRegistry(page, registryName, "SimpleStreams", {
    url: BUILTIN_IMAGE_REGISTRY_URL,
  });
  await createProject(page, project);
  await openProjectConfiguration(page);

  await page.getByText("Allow custom restrictions on a project level").click();
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await dismissNotification(page, `Project ${project} updated.`);

  await page
    .getByRole("navigation", { name: "Project form navigation" })
    .getByText("Images")
    .click();

  await activateOverride(page, "Available image registries");
  await expect(
    page.getByRole("radio", { name: "Built-in registries only (default)" }),
  ).toBeChecked();

  await page.getByText("Custom registries selection").click();
  await expect(page.getByText("Select at least one registry")).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Select registries" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Select at least one registry")).toBeVisible();
  await page
    .getByRole("checkbox", { name: "Built-in registries", exact: true })
    .click({ force: true });
  await expect(
    page.getByRole("checkbox", { name: BUILTIN_IMAGE_REGISTRY }),
  ).toBeDisabled();
  await page
    .getByRole("checkbox", { name: registryName })
    .click({ force: true });
  await page.getByRole("combobox", { name: "Select registries" }).click();
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await dismissNotification(page, `Project ${project} updated.`);

  await page
    .getByRole("row", { name: "Available image registries" })
    .getByRole("button", { name: "Edit" })
    .click();
  await page.getByText("Block all registries").click();
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await dismissNotification(page, `Project ${project} updated.`);
  await assertReadMode(page, "Available image registries", "No registries");

  await visitCreateInstancePage(page, project);
  await page.getByRole("button", { name: "* Base Image" }).click();
  await expect(page.getByText("No matching images found")).toBeVisible();

  await deleteProject(page, project);
  await deleteImageRegistry(page, registryName);
});
