import { Page, test } from "@playwright/test";
import { TIMEOUT } from "./constants";
import {
  assertCode,
  assertReadMode,
  setCodeInput,
  setCpuLimit,
  setInput,
  setMemLimit,
  setOption,
} from "./configuration-helpers";

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

test("profile cpu and memory", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);

  await page.goto("/ui/");
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByRole("link", { name: profile }).first().click();

  await setCpuLimit(page, "number", "42");
  await setCpuLimit(page, "fixed", "1,2,3,4");
  await setCpuLimit(page, "fixed", "1-23");
  await setMemLimit(page, "number", "2");
  await setMemLimit(page, "fixed", "3");

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
  await saveProfile(page);

  await assertReadMode(page, "Snapshot name pattern snap123");
  await assertReadMode(page, "Expire after 3m");
  await assertReadMode(page, "Snapshot stopped instances Yes");

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

const randomProfileName = (): string => {
  const r = (Math.random() + 1).toString(36).substring(7);
  return `playwright-profile-${r}`;
};

async function createProfile(page: Page, profile: string) {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByRole("button", { name: "Create profile" }).click();
  await page.getByLabel("Profile name").click();
  await page.getByLabel("Profile name").fill(profile);
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForSelector(`text=Profile ${profile} created.`, TIMEOUT);
}

async function deleteProfile(page: Page, profile: string) {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByRole("link", { name: profile }).first().click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Profile ${profile} deleted.`, TIMEOUT);
}

async function renameProfile(page: Page, old: string, newName: string) {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByRole("link", { name: old }).first().click();
  await page.getByRole("listitem", { name: old }).getByText(old).click();
  await page.getByRole("textbox").press("Control+a");
  await page.getByRole("textbox").fill(newName);
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByText("Profile renamed.").click();
}

async function saveProfile(page: Page) {
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForSelector(`text=Profile updated.`, TIMEOUT);
}

async function editProfile(page: Page, profile: string) {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByRole("link", { name: profile }).first().click();
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByRole("button", { name: "Edit profile" }).click();
}
