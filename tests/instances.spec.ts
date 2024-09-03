import { test, expect } from "./fixtures/lxd-test";
import {
  createImageFromInstance,
  createInstance,
  deleteInstance,
  editInstance,
  randomInstanceName,
  renameInstance,
  saveInstance,
  visitAndStartInstance,
  visitAndStopInstance,
  visitInstance,
} from "./helpers/instances";
import {
  assertCode,
  assertReadMode,
  setCodeInput,
  setCpuLimit,
  setInput,
  setMemLimit,
  setOption,
  setSchedule,
} from "./helpers/configuration";
import {
  createProfile,
  deleteProfile,
  randomProfileName,
} from "./helpers/profile";
import { assertTextVisible } from "./helpers/permissions";
import { deleteImage, getImageNameFromAlias } from "./helpers/images";

let instance = randomInstanceName();
let vmInstance = randomInstanceName();
let profile = randomProfileName();

test.beforeAll(async ({ browser, browserName }) => {
  instance = `${browserName}-${instance}`;
  vmInstance = `${browserName}-${vmInstance}`;
  profile = `${browserName}-${profile}`;
  const page = await browser.newPage();
  await createProfile(page, profile);
  await createInstance(page, instance);
  await createInstance(page, vmInstance, "virtual-machine");
  await page.close();
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  await deleteInstance(page, instance);
  await deleteInstance(page, vmInstance);
  await deleteProfile(page, profile);
  await page.close();
});

test("instance terminal operations", async ({ page }) => {
  await visitAndStartInstance(page, instance);
  await page.getByTestId("tab-link-Terminal").click();
  await page.getByRole("button", { name: "Reconnect" }).click();
  await page.getByLabel("Command").fill("sh");
  await page.getByLabel("submit reconnect").click();
  await assertTextVisible(page, "~ #");
  await page.waitForTimeout(1000); // ensure the terminal is ready
  await page.keyboard.type("cat /etc/issue");
  await page.keyboard.press("Enter");
  await expect(page.locator(".xterm-rows")).toContainText("Alpine Linux");
  let dialogPresent = false;
  page.on("dialog", (dialog) => {
    dialogPresent = true;
    void dialog.accept();
  });
  await page.getByTestId("tab-link-Overview").click();
  expect(dialogPresent).toEqual(true);
  await visitAndStopInstance(page, instance);
});

test("instance rename", async ({ page }) => {
  const newName = instance + "-rename";
  await renameInstance(page, instance, newName);
  instance = newName;
});

test("instance edit basic details", async ({ page }) => {
  await editInstance(page, instance);
  await page.getByPlaceholder("Enter description").fill("A-new-description");
  await page.getByRole("button", { name: "Add profile" }).click();
  await page.locator("#profile-1").selectOption(profile);
  await page.getByRole("button", { name: "move profile up" }).last().click();

  await saveInstance(page, instance);

  await assertTextVisible(page, "DescriptionA-new-description");
  await expect(page.locator("#profile-0")).toHaveValue(profile);
  await expect(page.locator("#profile-1")).toHaveValue("default");
});

test("instance cpu and memory", async ({ page }) => {
  await visitInstance(page, instance);

  await setCpuLimit(page, "number", "42");
  await saveInstance(page, instance);
  await assertReadMode(page, "Exposed CPU limit", "42");

  await setCpuLimit(page, "fixed", "1,2,3,4");
  await saveInstance(page, instance);
  await assertReadMode(page, "Exposed CPU limit", "1,2,3,4");

  await setCpuLimit(page, "fixed", "1-23");
  await saveInstance(page, instance);
  await assertReadMode(page, "Exposed CPU limit", "1-23");

  await setMemLimit(page, "percentage", "2");
  await saveInstance(page, instance);
  await assertReadMode(page, "Memory limit", "2%");

  await setMemLimit(page, "absolute", "3");
  await saveInstance(page, instance);
  await assertReadMode(page, "Memory limit", "3GiB");
});

test("instance edit resource limits", async ({ page }) => {
  await editInstance(page, instance);

  await page.getByText("Resource limits").click();
  await setOption(page, "Memory swap", "true");
  await setOption(page, "Disk priority", "1");
  await setInput(page, "Max number of processes", "Enter number", "2");

  await saveInstance(page, instance);

  await assertReadMode(page, "Memory swap (Containers only)", "Allow");
  await assertReadMode(page, "Disk priority", "1");
  await assertReadMode(page, "Max number of processes (Containers only)", "2");
});

test("instance edit security policies", async ({ page }) => {
  await editInstance(page, instance);

  await page.getByText("Security policies").click();
  await setOption(page, "Protect deletion", "false");
  await setOption(page, "Privileged", "true");
  await setOption(page, "Protect UID/GID shift", "true");
  await setInput(page, "Base host id", "Enter ID", "11");
  await setInput(page, "Idmap size", "Enter number", "22");
  await setOption(page, "Unique idmap", "true");
  await setOption(page, "Allow /dev/lxd in the instance", "true");
  await setOption(page, "Make /1.0/images API available", "true");

  await saveInstance(page, instance);

  await assertReadMode(page, "Protect deletion", "No");
  await assertReadMode(page, "Privileged (Containers only)", "Allow");
  await assertReadMode(page, "Protect UID/GID shift (Containers only)", "Yes");
  await assertReadMode(page, "Base host id (Containers only)", "11");
  await assertReadMode(page, "Idmap size (Containers only)", "22");
  await assertReadMode(page, "Unique idmap (Containers only)", "Yes");
  await assertReadMode(
    page,
    "Allow /dev/lxd in the instance (Containers only)",
    "Yes",
  );
  await assertReadMode(
    page,
    "Make /1.0/images API available over /dev/lxd (Containers only)",
    "Yes",
  );
});

test("instance edit snapshot configuration", async ({ page, lxdVersion }) => {
  await editInstance(page, instance);

  await page
    .getByRole("tabpanel", { name: "Configuration" })
    .getByText("Snapshots")
    .click();
  await setInput(page, "Snapshot name", "Enter name pattern", "snap123");
  await setInput(page, "Expire after", "Enter expiry expression", "3m");
  await setOption(page, "Snapshot stopped instances", "true");
  await setSchedule(page, "@daily", lxdVersion);

  await saveInstance(page, instance);

  await assertReadMode(page, "Snapshot name pattern", "snap123");
  await assertReadMode(page, "Expire after", "3m");
  await assertReadMode(page, "Snapshot stopped instances", "Yes");
  await assertReadMode(page, "Schedule", "@daily");
});

test("instance edit cloud init configuration", async ({ page }) => {
  await editInstance(page, instance);

  await page.getByText("Cloud init").click();
  await setCodeInput(page, "Network config", "foo:\n" + " - abc");
  await setCodeInput(page, "User data", "bar:\n" + " - def");
  await setCodeInput(page, "Vendor data", "baz:\n" + " - ghi");

  await saveInstance(page, instance);

  await assertCode(page, "Network config", "foo:");
  await assertCode(page, "User data", "bar:");
  await assertCode(page, "Vendor data", "baz:");
});

test("instance create vm", async ({ page }) => {
  test.skip(Boolean(process.env.CI), "github runners lack vm support");
  await editInstance(page, vmInstance);

  await page.getByText("Security policies").click();
  await setOption(page, "Enable secureboot (VMs only)", "true");

  await saveInstance(page, vmInstance);

  await assertReadMode(page, "Enable secureboot (VMs only)", "true");
});

test("instance yaml edit", async ({ page }) => {
  test.skip(Boolean(process.env.CI), "github runners lack vm support");
  await editInstance(page, vmInstance);
  await page.getByText("YAML configuration").click();
  await page.getByRole("button", { name: "Close notification" }).click();

  await page.locator(".view-lines").click();
  await page.getByText("description: ''").click();
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.type("A-new-description");
  await saveInstance(page, vmInstance);

  await page.getByText("YAML Configuration").click();
  await assertTextVisible(page, "DescriptionA-new-description");
});

test("Duplicate an instance", async ({ page }) => {
  await visitInstance(page, instance);
  await page.getByRole("button", { name: "Duplicate" }).click();
  await page
    .getByRole("dialog", { name: "Duplicate Instance" })
    .getByRole("button", { name: "Duplicate" })
    .click();

  await page.waitForSelector(`text=Created instance ${instance}-duplicate.`);
  await deleteInstance(page, `${instance}-duplicate`);
});

test("Create an image from an instance", async ({ page }) => {
  await page.goto("/ui/");
  const imageAlias = await createImageFromInstance(page, instance);
  const imageName = await getImageNameFromAlias(page, imageAlias);
  await deleteImage(page, imageName);
});

test("Bulk start, pause, unpause and stop instances", async ({ page }) => {
  await page.goto("/ui/");
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search and filter").fill(instance);
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");

  //Bulk start instances
  await page
    .getByRole("row", { name: "select Name Type Description Status Actions" })
    .getByLabel("multiselect rows")
    .click();
  await page
    .getByRole("button", { name: "Select all instances on this" })
    .click();
  await page
    .locator("button")
    .filter({ hasText: /^Start$/ })
    .click();
  await page
    .getByLabel("Confirm start")
    .getByRole("button", { name: "Start" })
    .click();
  await page.waitForSelector(`text=instance started.`);

  //Bulk restart instances
  await page.locator("button").filter({ hasText: "Restart" }).click();
  await page
    .getByLabel("Confirm restart")
    .getByRole("button", { name: "Restart" })
    .click();
  await page.waitForSelector(`text=instance restarted.`);

  //Bulk freeze instances
  await page.locator("button").filter({ hasText: "Freeze" }).click();
  await page
    .getByRole("dialog", { name: "Confirm freeze" })
    .getByRole("button", { name: "Freeze" })
    .click();
  await page.waitForSelector(`text=instance frozen.`);

  //Bulk Start instances
  await page
    .locator("button")
    .filter({ hasText: /^Start$/ })
    .click();
  await page
    .getByRole("dialog", { name: "Confirm start" })
    .getByRole("button", { name: "Start" })
    .click();
  await page.waitForSelector(`text=instance started.`);

  //Bulk Stop instances
  await page.locator("button").filter({ hasText: "Stop" }).click();
  await page
    .getByRole("dialog", { name: "Confirm stop" })
    .getByRole("button", { name: "Stop" })
    .click();
  await page.waitForSelector(`text=instance stopped.`);
});

test("Export and Upload an instance", async ({ page }) => {
  //Export an instance
  await visitInstance(page, instance);
  const downloadPromise = page.waitForEvent("download");

  await page.getByRole("button", { name: "Export" }).click();
  const download = await downloadPromise;
  await page.waitForSelector(`text=Instance ${instance} download started`);
  const INSTANCE_FILE = "tests/fixtures/instance.tar.gz";
  await download.saveAs(INSTANCE_FILE);

  //Upload an instance
  await page.goto("/ui/");
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByRole("button", { name: "Upload instance" }).click();
  await page.getByLabel("Instance backup file").setInputFiles(INSTANCE_FILE);
  await page.getByRole("textbox", { name: "Enter name" }).fill(`${instance}-1`);
  await page
    .getByLabel("Upload instance")
    .getByRole("button", { name: "Upload and create" })
    .click();
  await page.waitForSelector(`text=Created instance ${instance}-1`);
  await deleteInstance(page, `${instance}-1`);
});
