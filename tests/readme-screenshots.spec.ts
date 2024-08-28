import { expect, test } from "./fixtures/lxd-test";
import {
  createInstance,
  deleteInstance,
  visitAndStartInstance,
} from "./helpers/instances";
import { createProject, deleteProject } from "./helpers/projects";
import { createProfile, deleteProfile, visitProfile } from "./helpers/profile";

test.beforeEach(() => {
  test.skip(
    Boolean(process.env.CI),
    "This suite is only run manually to create screenshots for the readme file",
  );
});

test("instance creation screen", async ({ page }) => {
  await page.goto("/ui/");
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
  await page.goto("/ui/");
  const project = "my-cluster";
  await createProject(page, project);
  await visitProfile(page, "default", project);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Disk devices").click();
  await page.getByRole("button", { name: "Create override" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
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
  await page.goto(`/ui/project/${project}`);
  await page
    .getByRole("row", {
      name: "Select comic-glider Name Type Description Status Actions",
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
  await page.goto("/ui/");
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
  await page.goto("/ui/");
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
  await visitAndStartInstance(page, instance);
  await page.getByRole("button", { name: "Close notification" }).click();
  await page.getByTestId("tab-link-Console").click();
  await page.waitForTimeout(40000); // ensure the vm is booted

  await page.screenshot({
    path: "tests/screenshots/instance-graphical-console.png",
  });

  await deleteInstance(page, instance);
});

test("profile list screen", async ({ page }) => {
  await page.goto("/ui/");
  const project = "my-cluster";
  await createProject(page, project);
  await createProfile(page, "small", project);
  await createProfile(page, "medium", project);
  await createProfile(page, "large", project);
  await page.goto(`/ui/project/${project}/profiles`);

  await page.screenshot({ path: "tests/screenshots/profile-list.png" });

  await deleteProfile(page, "small", project);
  await deleteProfile(page, "medium", project);
  await deleteProfile(page, "large", project);
  await deleteProject(page, project);
});

test("storage pool screen", async ({ page }) => {
  await page.goto("/ui/");
  await page.getByText("Storage").click();
  await page.getByText("Pools").click();
  await page.getByText("Created").first().click();

  await page.screenshot({ path: "tests/screenshots/storage-pool-list.png" });
});

test("operations screen", async ({ page }) => {
  await page.goto("/ui/");
  await createInstance(page, "comic-glider");
  await page.getByRole("button", { name: "Close notification" }).click();
  await page.getByText("Operations").click();
  await page.getByText("Creating instance").first().click();

  await page.screenshot({ path: "tests/screenshots/operations-list.png" });

  await deleteInstance(page, "comic-glider");
});

test("warnings screen", async ({ page }) => {
  await page.goto("/ui/");
  await page.getByText("Warnings").click();

  await page.screenshot({ path: "tests/screenshots/warnings-list.png" });
});
