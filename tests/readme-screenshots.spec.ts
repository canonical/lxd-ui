import { expect, test } from "./fixtures/lxd-test";
import {
  createInstance,
  deleteInstance,
  visitAndStartInstance,
} from "./helpers/instances";
import { createProject, deleteProject } from "./helpers/projects";
import { createProfile, deleteProfile, visitProfile } from "./helpers/profile";
import { gotoURL } from "./helpers/navigate";
import {
  createVolume,
  deleteVolume,
  visitVolume,
} from "./helpers/storageVolume";
import {
  addPermission,
  deleteGroup,
  selectOption,
} from "./helpers/permission-groups";

test.beforeEach(() => {
  test.skip(
    Boolean(process.env.CI),
    "This suite is only run manually to create screenshots for the readme file",
  );
});

test("instance creation screen", async ({ page }) => {
  await gotoURL(page, "/ui/");
  await page.getByText("Instances", { exact: true }).click();
  await page.getByText("Create instance").click();
  await page.getByPlaceholder("Enter name").fill("comic-glider");
  await page.getByRole("button", { name: "Browse images" }).click();
  await page
    .locator("tr")
    .filter({ hasText: "Ubuntu24.04 LTS" })
    .first()
    .getByRole("button")
    .click();

  await page.screenshot({ path: "tests/screenshots/create-instance.png" });
});

test("instance list screen", async ({ page }) => {
  await gotoURL(page, "/ui/");
  const project = "my-cluster";
  await createProject(page, project);
  await visitProfile(page, "default", project);
  const instances = [
    "comic-glider",
    "deciding-flounder",
    "native-sailfish",
    "precise-lacewing",
    "ready-grizzly",
    "singular-moose",
  ];
  for (const instance of instances) {
    await createInstance(page, instance, "container", project, "24.04");
  }
  await gotoURL(page, `/ui/project/${project}`);
  await page
    .getByRole("row", {
      name: "Select comic-glider my-cluster Name Type Description Status Actions",
    })
    .getByLabel("Type")
    .click();

  await page.screenshot({ path: "tests/screenshots/instance-list.png" });

  for (const instance of instances) {
    await deleteInstance(page, instance, project);
  }
  await page.getByRole("link", { name: "Images", exact: true }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByText("Delete", { exact: true }).click();
  await deleteProject(page, project);
});

test("instance terminal screen", async ({ page }) => {
  await gotoURL(page, "/ui/");
  const instance = "comic-glider";
  await createInstance(page, instance, "container", "default", "24.04");
  await visitAndStartInstance(page, instance);
  await page.getByRole("button", { name: "Close notification" }).click();
  await page.getByTestId("tab-link-Terminal").click();
  await expect(page.getByText("~#")).toBeVisible();
  await page.waitForTimeout(1000); // ensure the terminal is ready
  await page.keyboard.type("cd /");
  await page.keyboard.press("Enter");
  await page.keyboard.type("ll");
  await page.keyboard.press("Enter");
  await page.keyboard.type("cat /etc/issue");
  await page.keyboard.press("Enter");

  await page.screenshot({ path: "tests/screenshots/instance-terminal.png" });

  await deleteInstance(page, instance);
});

test("instance graphical console screen", async ({ page }) => {
  await gotoURL(page, "/ui/");
  const instance = "upright-pangolin";
  await page.getByText("Instances", { exact: true }).click();
  await page.getByText("Create instance").click();
  await page.getByPlaceholder("Enter name").fill(instance);
  await page.getByRole("button", { name: "Browse images" }).click();
  await page
    .locator("tr")
    .filter({ hasText: "ubuntu/24.04/desktop" })
    .first()
    .getByRole("button")
    .click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Created instance ${instance}.`);
  await visitAndStartInstance(page, instance);
  await page.getByRole("button", { name: "Close notification" }).click();
  await page.getByTestId("tab-link-Console").click();
  await page.waitForTimeout(60000); // ensure the vm is booted

  await page.screenshot({
    path: "tests/screenshots/instance-graphical-console.png",
  });

  await deleteInstance(page, instance);
});

test("profile list screen", async ({ page }) => {
  await gotoURL(page, "/ui/");
  const project = "my-cluster";
  await createProject(page, project);
  await createProfile(page, "small", project);
  await createProfile(page, "medium", project);
  await createProfile(page, "large", project);
  await gotoURL(page, `/ui/project/${project}/profiles`);
  await page.getByText("Showing all 4 profiles").click();

  await page.screenshot({ path: "tests/screenshots/profile-list.png" });

  await deleteProfile(page, "small", project);
  await deleteProfile(page, "medium", project);
  await deleteProfile(page, "large", project);
  await deleteProject(page, project);
});

test("storage pool screen", async ({ page }) => {
  await gotoURL(page, "/ui/");
  await page.getByText("Storage").click();
  await page.getByText("Pools").click();
  await page.getByText("Created").first().click();

  await page.screenshot({ path: "tests/screenshots/storage-pool-list.png" });
});

test("operations screen", async ({ page }) => {
  await gotoURL(page, "/ui/");
  await createInstance(page, "comic-glider");
  await page.getByRole("button", { name: "Close notification" }).click();
  await page.getByText("Operations").click();
  await page.getByText("Creating instance").first().click();
  await page.waitForTimeout(3000); // ensure reload button is in loaded state

  await page.screenshot({ path: "tests/screenshots/operations-list.png" });

  await deleteInstance(page, "comic-glider");
});

test("warnings screen", async ({ page }) => {
  await gotoURL(page, "/ui/");
  await page.getByText("Warnings").click();
  await page.getByText("last message").click();

  await page.screenshot({ path: "tests/screenshots/warnings-list.png" });
});

test("storage volume snapshot", async ({ page }) => {
  const volume = "custom-volume";
  await createVolume(page, volume);
  await visitVolume(page, volume);
  await page.getByTestId("tab-link-Snapshots").click();
  await page.getByText("create snapshot").click();
  await page
    .getByRole("button", { name: "Create snapshot", exact: true })
    .last()
    .click();
  await page.waitForSelector(
    `text=Snapshot snap0 created for volume ${volume}.`,
  );

  await page.screenshot({ path: "tests/screenshots/storage-volume-snap.png" });

  await deleteVolume(page, volume);
});

test("permission group create", async ({ page }) => {
  const group = "instance managers (default project)";
  await gotoURL(page, "/ui/");
  await page.getByText("Permissions").click();
  await page.getByText("Groups", { exact: true }).click();
  await page.getByText("Create group").click();
  await page.getByPlaceholder("Enter name").fill(group);
  await page.getByText("Add permissions").click();
  await addPermission(page, "Project", "default", "viewer");
  await selectOption(page, "Entitlement", "instance_manager");
  await page.getByRole("button", { name: "Add" }).click();

  await page.screenshot({
    path: "tests/screenshots/group-create-permission.png",
  });

  await page
    .getByRole("heading", { name: "Create group / Add permissions" })
    .getByRole("button")
    .click();

  await page.screenshot({
    path: "tests/screenshots/group-create-overview.png",
  });

  await page
    .getByLabel("Side panel")
    .getByRole("button", { name: "Create group" })
    .click();

  await page.waitForSelector(`text=Group ${group} created.`);
  await page.waitForTimeout(1000); // notification animation finished

  await page.screenshot({ path: "tests/screenshots/group-list.png" });

  await deleteGroup(page, group);
});

test("network acl", async ({ page }) => {
  await gotoURL(page, "/ui/");
  await page.getByText("Networking").click();
  await page.getByText("ACLs").click();
  await page.getByText("Create ACL").click();
  await page.getByPlaceholder("Enter name").fill("http and https access");
  await page.getByText("Add ingress rule").click();
  await page.getByPlaceholder("Enter destination port").fill("80");
  await page.getByText("Add rule").click();
  await page.getByText("Add ingress rule").click();
  await page.getByPlaceholder("Enter destination port").fill("443");
  await page.getByText("Add rule").click();

  await page.screenshot({ path: "tests/screenshots/network-acl-create.png" });
});

// this test assumes a microcloud backend
test("network detail", async ({ page }) => {
  await gotoURL(page, "/ui/project/default/network/UPLINK");
  await page.waitForSelector("text=default");
  await page.waitForTimeout(3000); // loading network details can take some time

  await page.screenshot({ path: "tests/screenshots/network-detail.png" });
});

test("server settings", async ({ page }) => {
  await gotoURL(page, "/ui/settings");
  await page.waitForSelector("text=acme.agree_tos");
  await page.waitForTimeout(3000); // loading network details can take some time

  await page.screenshot({ path: "tests/screenshots/server-settings.png" });
});

// this test assumes a microcloud backend
test("cluster list", async ({ page }) => {
  await gotoURL(page, "/ui/cluster");
  await page.waitForSelector("text=Showing all 3 cluster members");
  await page.waitForTimeout(3000); // loading network details can take some time

  await page.screenshot({ path: "tests/screenshots/cluster-list.png" });
});
