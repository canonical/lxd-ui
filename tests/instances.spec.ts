import { test, expect } from "./fixtures/lxd-test";
import {
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
  await expect(page.locator(".xterm-screen")).toBeVisible();
  await page.keyboard.type("lsb_release -a");
  await page.keyboard.press("Enter");
  await expect(page.locator(".xterm-rows")).toContainText("Ubuntu");
  let dialogPresent = false;
  page.on("dialog", (dialog) => {
    expect(dialog.type()).toEqual("confirm");
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

  await page.getByText("DescriptionA-new-description").click();
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

  await page.locator(".view-lines").click();
  await page.keyboard.press("PageDown");
  await page.keyboard.press("PageDown");
  await page.keyboard.press("PageDown");
  await page.getByText("description: ''").click();
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.type("A-new-description");
  await saveInstance(page, vmInstance);

  await page.getByText("Main configuration").click();
  await page.getByText("DescriptionA-new-description").click();
});
