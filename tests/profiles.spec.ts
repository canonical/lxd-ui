import { test } from "@playwright/test";
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

test("profile create and remove", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);
  await deleteProfile(page, profile);
});

test("profile rename", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);

  const newName = profile + "-rename";
  await renameProfile(page, profile, newName);

  await deleteProfile(page, newName);
});

test("profile edit basic details", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);
  await editProfile(page, profile);

  await page.getByPlaceholder("Enter description").fill("A-new-description");

  await saveProfile(page);

  await page.getByText("DescriptionA-new-description").click();

  await deleteProfile(page, profile);
});

test("profile cpu and memory", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);
  await visitProfile(page, profile);

  await setCpuLimit(page, "number", "42");
  await saveProfile(page);
  await assertReadMode(page, "Exposed CPUs 42");

  await setCpuLimit(page, "fixed", "1,2,3,4");
  await saveProfile(page);
  await assertReadMode(page, "Exposed CPUs 1,2,3,4");

  await setCpuLimit(page, "fixed", "1-23");
  await saveProfile(page);
  await assertReadMode(page, "Exposed CPUs 1-23");

  await setMemLimit(page, "percentage", "2");
  await saveProfile(page);
  await assertReadMode(page, "Memory limit 2%");

  await setMemLimit(page, "absolute", "3");
  await saveProfile(page);
  await assertReadMode(page, "Memory limit 3GiB");

  await deleteProfile(page, profile);
});

test("profile resource limits", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);
  await editProfile(page, profile);

  await page.getByText("Resource limits").click();
  await setOption(page, "Memory swap", "true");
  await setOption(page, "Disk priority", "1");
  await setInput(page, "Max number of processes", "Enter number", "2");
  await saveProfile(page);

  await assertReadMode(page, "Memory swap (Containers only)	Allow");
  await assertReadMode(page, "Disk priority 1");
  await assertReadMode(page, "Max number of processes (Containers only) 2");

  await deleteProfile(page, profile);
});

test("profile security policies", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);
  await editProfile(page, profile);
  await page.getByText("Security policies").click();

  await setOption(page, "Prevent the instance from being deleted", "true");
  await setOption(page, "Run the instance in privileged mode", "true");
  await setOption(
    page,
    "Prevent instance file system from being UID/GID shifted",
    "true"
  );
  await setInput(page, "Base host id", "Enter ID", "11");
  await setInput(page, "Idmap size", "Enter number", "22");
  await setOption(page, "Unique idmap usage", "true");
  await setOption(page, "Allow /dev/lxd in the instance", "true");
  await setOption(page, "Make /1.0/images API available", "true");
  await setOption(page, "Enable secureboot", "true");
  await saveProfile(page);

  await assertReadMode(page, "Prevent the instance from being deleted Yes");
  await assertReadMode(
    page,
    "Run the instance in privileged mode (Containers only) Allow"
  );
  await assertReadMode(
    page,
    "Prevent instance file system from being UID/GID shifted on startup (Containers only) Yes"
  );
  await assertReadMode(page, "Base host id (Containers only) 11");
  await assertReadMode(page, "Idmap size (Containers only) 22");
  await assertReadMode(page, "Unique idmap usage (Containers only) Yes");
  await assertReadMode(
    page,
    "Allow /dev/lxd in the instance (Containers only) Yes"
  );
  await assertReadMode(
    page,
    "Make /1.0/images API available over /dev/lxd (Containers only) Yes"
  );
  await assertReadMode(page, "Enable secureboot (VMs only) true");

  await deleteProfile(page, profile);
});

test("profile snapshots", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);
  await editProfile(page, profile);
  await page.getByText("Snapshots").click();

  await setInput(page, "Snapshot name", "Enter name pattern", "snap123");
  await setInput(page, "Expire after", "Enter expiry expression", "3m");
  await setOption(page, "Snapshot stopped instances", "true");
  await setSchedule(page, "@daily");

  await saveProfile(page);

  await assertReadMode(page, "Snapshot name pattern snap123");
  await assertReadMode(page, "Expire after 3m");
  await assertReadMode(page, "Snapshot stopped instances Yes");
  await assertReadMode(page, "Schedule @daily");

  await deleteProfile(page, profile);
});

test("profile cloud init", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);
  await editProfile(page, profile);
  await page.getByText("Cloud init").click();

  await setCodeInput(page, "Network config", "foo:\n" + " - abc");
  await setCodeInput(page, "User data", "bar:\n" + " - def");
  await setCodeInput(page, "Vendor data", "baz:\n" + " - ghi");
  await saveProfile(page);

  await assertCode(page, "Network config", "foo:");
  await assertCode(page, "User data", "bar:");
  await assertCode(page, "Vendor data", "baz:");

  await deleteProfile(page, profile);
});

test("profile yaml edit", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);
  await editProfile(page, profile);
  await page.getByText("YAML configuration").click();

  await page.locator(".view-lines").click();
  await page.keyboard.press("Control+a");
  await page.keyboard.type(`config: {}
description: 'A-new-description'
devices: {}
name: ${profile}`);
  await saveProfile(page);

  await page.getByText("Profile details").click();
  await page.getByText("DescriptionA-new-description").click();

  await deleteProfile(page, profile);
});
