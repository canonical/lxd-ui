import { test, expect } from "./fixtures/lxd-test";
import {
  assertReadMode,
  setInput,
  setMultiselectOption,
  setOption,
  setTextarea,
} from "./helpers/configuration";
import { assertTextVisible } from "./helpers/permissions";
import {
  createProject,
  deleteProject,
  randomProjectName,
  renameProject,
} from "./helpers/projects";

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
  await page.getByPlaceholder("Enter description").fill("A-new-description");
  await page
    .getByRole("combobox", { name: "Features" })
    .selectOption("customised");
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
  await setMultiselectOption(page, "Cluster groups", "default");
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

  await page.getByRole("button", { name: "Save 35 changes" }).click();

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
  await assertReadMode(page, "Cluster groups targeting", "default");
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
