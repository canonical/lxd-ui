import { test, expect } from "./fixtures/lxd-test";
import {
  assertReadMode,
  setInput,
  setOption,
  setTextarea,
} from "./helpers/configuration";
import { assertTextVisible } from "./helpers/permissions";
import {
  confirmDelete,
  createProject,
  deleteProject,
  randomProjectName,
  renameProject,
} from "./helpers/projects";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
} from "./helpers/instances";
import { deleteAllImages } from "./helpers/images";

test("project create and remove", async ({ page }) => {
  const project = randomProjectName();
  await createProject(page, project);
  await deleteProject(page, project);
});

test("project rename", async ({ page }) => {
  const project = randomProjectName();
  await createProject(page, project);

  const newName = project + "-rename";
  await renameProject(page, project, newName);

  await deleteProject(page, newName);
});

test("project edit configuration", async ({ page, lxdVersion }) => {
  const project = randomProjectName();
  await createProject(page, project);

  await page.getByRole("link", { name: "Configuration" }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000); // Wait for the form state to be fully loaded
  await page.getByPlaceholder("Enter description").fill("A-new-description");
  await page.locator("span").filter({ hasText: "Networks" }).click();
  if (lxdVersion === "5.0-edge") {
    await expect(
      page.locator("label").filter({ hasText: "Network zones" }),
    ).toBeHidden();
  } else {
    await page.locator("label").filter({ hasText: "Network zones" }).click();
  }

  await page.getByText("Allow custom restrictions on a project level").click();
  await page.getByText("Resource limits").click();
  await setInput(page, "Max number of instances", "Enter number", "1");
  await setInput(page, "Max number of containers", "Enter number", "2");
  await setInput(page, "Max number of VMs", "Enter number", "3");
  await setInput(page, "Max disk space", "Enter value", "4");
  await setInput(page, "Max number of networks", "Enter number", "5");
  await setInput(page, "Max sum of CPU", "Enter number", "6");
  await setInput(page, "Max sum of memory", "Enter value", "7");
  await setInput(page, "Max sum of processes", "Enter number", "8");

  await page.getByText("Clusters").click();
  await setOption(page, "Direct cluster targeting", "allow");

  await page
    .getByRole("navigation", { name: "Project form navigation" })
    .getByText("Instances")
    .click();
  await setOption(page, "Low level VM operations", "allow");
  await setOption(page, "Low level container operations", "allow");
  await setOption(page, "Container nesting", "allow");
  await setOption(page, "Container privilege", "allow");
  await setOption(page, "Container interception", "allow");
  await setOption(page, "Snapshot creation", "allow");
  await setInput(page, "Idmap UID", "Enter UID ranges", "10");
  await setInput(page, "Idmap GID", "Enter GID ranges", "11");

  await page.getByText("Device usage").click();
  await setOption(page, "Disk devices (except the root one)", "allow");
  await setInput(page, "Disk devices path", "Enter paths", "/");
  await setOption(page, "GPU devices", "allow");
  await setOption(page, "Infiniband devices", "allow");
  await setOption(page, "Network devices", "allow");
  await setOption(page, "PCI devices", "allow");
  await setOption(page, "Unix-block devices", "allow");
  await setOption(page, "Unix-char devices", "allow");
  await setOption(page, "Unix-hotplug devices", "allow");
  await setOption(page, "USB devices", "allow");

  await page
    .getByRole("navigation", { name: "Project form navigation" })
    .getByText("Networks")
    .click();
  await setTextarea(page, "Available networks", "lxdbr0");
  await setTextarea(page, "Network uplinks", "lxdbr0");
  await setTextarea(page, "Network zones", "foo,bar");

  if (lxdVersion === "5.0-edge") {
    // network zones option is not available in 5.0-edge, so total changes are one less
    await page.getByRole("button", { name: "Save 33 changes" }).click();
  } else {
    await page.getByRole("button", { name: "Save 34 changes" }).click();
  }

  await page.waitForSelector(`text=Project ${project} updated.`);
  await page.getByRole("button", { name: "Close notification" }).click();

  await page.getByText("Project details").click();

  await assertTextVisible(page, "DescriptionA-new-description");
  await expect(page.locator("input#features_networks")).toHaveValue("on");
  if (lxdVersion !== "5.0-edge") {
    await expect(page.locator("input#features_networks_zones")).toHaveValue(
      "on",
    );
  }

  await page.getByText("Resource limits").click();
  await assertReadMode(page, "Max number of instances", "1");
  await assertReadMode(page, "Max number of containers", "2");
  await assertReadMode(page, "Max number of VMs", "3");
  await assertReadMode(page, "Max disk space (used by all instances)", "4GiB");
  await assertReadMode(page, "Max number of networks", "5");
  await assertReadMode(page, "Max sum of CPU", "6");
  await assertReadMode(page, "Max sum of memory limits", "7GiB");
  await assertReadMode(page, "Max sum of processes", "8");

  await page.getByText("Clusters").click();
  await assertReadMode(page, "Cluster groups targeting", "");
  await assertReadMode(page, "Direct cluster targeting", "Allow");

  await page
    .getByRole("navigation", { name: "Project form navigation" })
    .getByText("Instances")
    .click();
  await assertReadMode(page, "Low level VM operations", "Allow");
  await assertReadMode(page, "Low level container operations", "Allow");
  await assertReadMode(page, "Container nesting", "Allow");
  await assertReadMode(page, "Container privilege", "Allow");
  await assertReadMode(page, "Container interception", "Allow");
  await assertReadMode(page, "Snapshot creation", "Allow");
  await assertReadMode(page, "Idmap UID", "10");
  await assertReadMode(page, "Idmap GID", "11");

  await page.getByText("Device usage").click();
  await assertReadMode(page, "Disk devices (except the root one)", "Allow");
  await assertReadMode(page, "Disk devices path", "/");
  await assertReadMode(page, "GPU devices", "Allow");
  await assertReadMode(page, "Infiniband devices", "Allow");
  await assertReadMode(page, "Network devices", "Allow");
  await assertReadMode(page, "PCI devices", "Allow");
  await assertReadMode(page, "Unix-block devices", "Allow");
  await assertReadMode(page, "Unix-char devices", "Allow");
  await assertReadMode(page, "Unix-hotplug devices", "Allow");
  await assertReadMode(page, "USB devices", "Allow");

  await page
    .getByRole("navigation", { name: "Project form navigation" })
    .getByText("Networks")
    .click();
  await assertReadMode(page, "Available networks", "lxdbr0");
  await assertReadMode(page, "Network uplinks", "lxdbr0");
  await assertReadMode(page, "Network zones", "foo,bar");

  await deleteProject(page, project);
});

test("retain custom project selection on browsing pages for all projects", async ({
  page,
}) => {
  const project = randomProjectName();
  await createProject(page, project);
  await page.getByRole("link", { name: "Operations" }).click();
  await page.getByRole("button", { name: "Refresh" }).click();
  await page.waitForLoadState("networkidle");

  expect(page.getByText("Project" + project)).toBeVisible();
});

test("project deletion with instances - force delete supported", async ({
  page,
  lxdVersion,
}) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "The necessary projects_force_delete API extension is not backported to LXD 5.0",
  );

  const project = randomProjectName();
  const instance = randomInstanceName();

  await createProject(page, project);
  await createInstance(page, instance, "container", project);
  await page.getByRole("link", { name: "Configuration" }).click();
  await page.waitForSelector("text=Project configuration");

  const deleteButton = page.getByRole("button", { name: "Delete" });
  await expect(deleteButton).toBeEnabled();

  await deleteButton.hover();
  await expect(
    page.getByText("Delete project and all its resources"),
  ).toBeVisible();

  await deleteButton.click();

  await page.getByRole("dialog", { name: "Confirm delete" }).waitFor();
  await expect(
    page.getByText("The following items will also be deleted:"),
  ).toBeVisible();

  await expect(page.getByText("Instance (1)")).toBeVisible();
  await expect(
    page.getByRole("row", { name: /Instance \(1\)/ }).getByText(instance),
  ).toBeVisible();

  await confirmDelete(page, project);
});

test("project deletion with instances - force delete not supported", async ({
  page,
  lxdVersion,
}) => {
  test.skip(
    lxdVersion !== "5.0-edge",
    "This test is specifically for LXD versions that don't support projects_force_delete",
  );

  const project = randomProjectName();
  const instance = randomInstanceName();

  await createProject(page, project);
  await createInstance(page, instance, "container", project);
  await page.getByRole("link", { name: "Configuration" }).click();
  await page.waitForSelector("text=Project configuration");

  const deleteButton = page.getByRole("button", { name: "Delete" });
  await expect(deleteButton).toBeDisabled();

  // Check the tooltip shows detailed explanation with upgrade instructions
  await deleteButton.hover();
  await expect(
    page.getByText("Cannot delete non-empty project."),
  ).toBeVisible();
  await expect(page.getByText("Project is used by:")).toBeVisible();
  await expect(page.getByText("Instances (1)")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Instances" }).first(),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Remove all resources first, or upgrade to LXD 6.6 or newer to use force deletion.",
    ),
  ).toBeVisible();

  await deleteInstance(page, instance, project);
  await deleteAllImages(page, project);

  await page.getByRole("link", { name: "Configuration" }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("text=Project configuration");

  // Now the delete button should be enabled because the project is empty
  await expect(deleteButton).toBeEnabled();

  await deleteButton.click();
  await page.getByRole("dialog", { name: "Confirm delete" }).waitFor();

  await confirmDelete(page, project);
});
