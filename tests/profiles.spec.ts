import { test } from "./fixtures/lxd-test";
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
  editProfile,
  randomProfileName,
  renameProfile,
  saveProfile,
  visitProfile,
} from "./helpers/profile";

let profile = randomProfileName();

test.beforeAll(async ({ browserName, browser }) => {
  profile = `${browserName}-${profile}`;
  const page = await browser.newPage();
  await createProfile(page, profile);
  await page.close();
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  await deleteProfile(page, profile);
  await page.close();
});

test("profile rename", async ({ page }) => {
  const newName = profile + "-rename";
  await renameProfile(page, profile, newName);
  profile = newName;
});

test("profile edit basic details", async ({ page }) => {
  await editProfile(page, profile);

  await page.getByPlaceholder("Enter description").fill("A-new-description");

  await saveProfile(page, profile);

  await page.getByText("DescriptionA-new-description").click();
});

test("profile cpu and memory", async ({ page }) => {
  await visitProfile(page, profile);

  await setCpuLimit(page, "number", "42");
  await saveProfile(page, profile);
  await assertReadMode(page, "Exposed CPU limit", "42");

  await setCpuLimit(page, "fixed", "1,2,3,4");
  await saveProfile(page, profile);
  await assertReadMode(page, "Exposed CPU limit", "1,2,3,4");

  await setCpuLimit(page, "fixed", "1-23");
  await saveProfile(page, profile);
  await assertReadMode(page, "Exposed CPU limit", "1-23");

  await setMemLimit(page, "percentage", "2");
  await saveProfile(page, profile);
  await assertReadMode(page, "Memory limit", "2%");

  await setMemLimit(page, "absolute", "3");
  await saveProfile(page, profile);
  await assertReadMode(page, "Memory limit", "3GiB");
});

test("profile resource limits", async ({ page }) => {
  await editProfile(page, profile);

  await page.getByText("Resource limits").click();
  await setOption(page, "Memory swap", "true");
  await setOption(page, "Disk priority", "1");
  await setInput(page, "Max number of processes", "Enter number", "2");
  await saveProfile(page, profile);

  await assertReadMode(page, "Memory swap (Containers only)", "Allow");
  await assertReadMode(page, "Disk priority", "1");
  await assertReadMode(page, "Max number of processes (Containers only)", "2");
});

test("profile security policies", async ({ page }) => {
  await editProfile(page, profile);
  await page.getByText("Security policies").click();

  await setOption(page, "Protect deletion", "true");
  await setOption(page, "Privileged", "true");
  await setOption(page, "Protect UID/GID shift", "true");
  await setInput(page, "Base host id", "Enter ID", "11");
  await setInput(page, "Idmap size", "Enter number", "22");
  await setOption(page, "Unique idmap", "true");
  await setOption(page, "Allow /dev/lxd in the instance", "true");
  await setOption(page, "Make /1.0/images API available", "true");
  await setOption(page, "Enable secureboot", "true");
  await saveProfile(page, profile);

  await assertReadMode(page, "Protect deletion", "Yes");
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
  await assertReadMode(page, "Enable secureboot (VMs only)", "true");
});

test("profile snapshots", async ({ page, lxdVersion }) => {
  await editProfile(page, profile);
  await page.getByText("Snapshots").click();

  await setInput(page, "Snapshot name", "Enter name pattern", "snap123");
  await setInput(page, "Expire after", "Enter expiry expression", "3m");
  await setOption(page, "Snapshot stopped instances", "true");
  await setSchedule(page, "@daily", lxdVersion);

  await saveProfile(page, profile);

  await assertReadMode(page, "Snapshot name pattern", "snap123");
  await assertReadMode(page, "Expire after", "3m");
  await assertReadMode(page, "Snapshot stopped instances", "Yes");
  await assertReadMode(page, "Schedule", "@daily");
});

test("profile cloud init", async ({ page }) => {
  await editProfile(page, profile);
  await page.getByText("Cloud init").click();

  await setCodeInput(page, "Network config", "foo:\n" + " - abc");
  await setCodeInput(page, "User data", "bar:\n" + " - def");
  await setCodeInput(page, "Vendor data", "baz:\n" + " - ghi");
  await saveProfile(page, profile);

  await assertCode(page, "Network config", "foo:");
  await assertCode(page, "User data", "bar:");
  await assertCode(page, "Vendor data", "baz:");
});

test("profile yaml edit", async ({ page }) => {
  await editProfile(page, profile);
  await page.getByText("YAML configuration").click();

  await page.locator(".view-lines").click();
  await page.keyboard.press("Control+a");
  await page.keyboard.type(`config: {}
description: 'A-new-description'
devices: {}
name: ${profile}`);
  await saveProfile(page, profile);

  await page.getByText("Main configuration").click();
  await page.getByText("DescriptionA-new-description").click();
});
