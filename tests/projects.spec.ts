import { Page, test } from "@playwright/test";
import { TIMEOUT } from "./constants";
import { assertReadMode, setInput, setOption } from "./configuration-helpers";

test("project create and remove", async ({ page }) => {
  const project = randomProjectName();
  await createProject(page, project);
  await deleteProject(page, project);
});

test("project edit configuration", async ({ page }) => {
  const project = randomProjectName();
  await createProject(page, project);

  await page.getByRole("link", { name: "Configuration" }).click();
  await page.getByRole("button", { name: "Edit configuration" }).click();
  await page.getByPlaceholder("Enter description").fill("desc");
  await page
    .getByRole("combobox", { name: "Features" })
    .selectOption("customised");
  await page.locator("span").filter({ hasText: "Networks" }).click();
  await page.locator("label").filter({ hasText: "Network zones" }).click();
  await page.getByText("Allow custom restrictions on a project level").click();

  await page.getByText("Resource limits").click();
  await setInput(page, "Max number of instances", "Enter number", "1");
  await setInput(page, "Max number of containers", "Enter number", "2");
  await setInput(page, "Max number of VMs", "Enter number", "3");
  await setInput(page, "Max disk space", "Enter value", "4");
  await setInput(page, "Max number of networks", "Enter number", "5");
  await setInput(page, "Max sum of individual CPU", "Enter number", "6");
  await setInput(page, "Max sum of individual memory", "Enter number", "7");
  await setInput(page, "Max sum of individual processes", "Enter number", "8");

  await page.getByText("Restrictions").click();
  await page.getByText("Clusters").click();
  await setInput(page, "Cluster groups targeting", "Enter value", "9");
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
  await setOption(page, "Disk devices", "allow");
  await setInput(page, "Disk devices path", "Enter paths", "/");
  await setOption(page, "GPU devices", "allow");
  await setOption(page, "Infiniband devices", "allow");
  await setOption(page, "Network devices", "allow");
  await setOption(page, "PCI devices", "allow");
  await setOption(page, "Unix-block devices", "allow");
  await setOption(page, "Unix-char devices", "allow");
  await setOption(page, "Unix-hotplug devices", "allow");
  await setOption(page, "USB devices", "allow");

  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByText("Project updated.").click();

  await page.getByText("Resource limits").click();
  await assertReadMode(page, "Max number of instances 1");
  await assertReadMode(page, "Max number of containers 2");
  await assertReadMode(page, "Max number of VMs 3");
  await assertReadMode(page, "Max disk space (used by all instances) 4Gib");
  await assertReadMode(page, "Max number of networks 5");
  await assertReadMode(page, "Max sum of individual CPU configurations 6");
  await assertReadMode(page, "Max sum of individual memory limits 7");
  await assertReadMode(
    page,
    "Max sum of individual processes configurations 8"
  );

  await page.getByText("Clusters").click();
  await assertReadMode(page, "Cluster groups targeting 9");
  await assertReadMode(page, "Direct cluster targeting Allow");

  await page
    .getByRole("navigation", { name: "Project form navigation" })
    .getByText("Instances")
    .click();
  await assertReadMode(page, "Low level VM operations allow");
  await assertReadMode(page, "Low level container operations allow");
  await assertReadMode(page, "Container nesting allow");
  await assertReadMode(page, "Container privilege allow");
  await assertReadMode(page, "Container interception allow");
  await assertReadMode(page, "Snapshot creation allow");
  await assertReadMode(page, "Idmap UID 10");
  await assertReadMode(page, "Idmap GID 11");

  await page.getByText("Device usage").click();
  await assertReadMode(page, "Disk devices (except the root one) allow");
  await assertReadMode(page, "Disk devices path /");
  await assertReadMode(page, "GPU devices Allow");
  await assertReadMode(page, "Infiniband devices Allow");
  await assertReadMode(page, "Network devices Allow");
  await assertReadMode(page, "PCI devices Allow");
  await assertReadMode(page, "Unix-block devices Allow");
  await assertReadMode(page, "Unix-char devices Allow");
  await assertReadMode(page, "Unix-hotplug devices Allow");
  await assertReadMode(page, "USB devices Allow");

  await deleteProject(page, project);
});

const randomProjectName = (): string => {
  const r = (Math.random() + 1).toString(36).substring(7);
  return `playwright-project-${r}`;
};

async function createProject(page: Page, project: string) {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Instances" }).click();
  await page.getByRole("button", { name: "default" }).click();
  await page.getByRole("button", { name: "Create project" }).click();
  await page.getByPlaceholder("Enter name").click();
  await page.getByPlaceholder("Enter name").fill(project);
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForSelector(`text=Project ${project} created.`, TIMEOUT);
}

async function deleteProject(page: Page, project: string) {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Instances" }).click();
  await page.getByRole("button", { name: "default" }).click();
  await page.getByRole("link", { name: project }).click();
  await page.getByRole("link", { name: "Configuration" }).click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Project ${project} deleted.`, TIMEOUT);
}
