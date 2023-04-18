import { test } from "@playwright/test";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
  renameInstance,
} from "./instance-helpers";
import {
  assertCode,
  assertReadMode,
  setCodeInput,
  setInput,
  setOption,
} from "./configuration-helpers";
import { TIMEOUT } from "./constants";

test("instance create and remove", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await deleteInstance(page, instance);
});

test("instance rename", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);

  const newName = instance + "-rename";
  await renameInstance(page, instance, newName);

  await deleteInstance(page, newName);
});

test("instance configuration edit", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);

  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(instance);
  await page.getByRole("link", { name: instance }).first().click();
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByRole("button", { name: "Edit instance" }).click();

  await page.getByText("Resource limits").click();
  await setOption(page, "Memory swap", "true");
  await setOption(page, "Disk priority", "1");
  await setInput(page, "Max number of processes", "Enter number", "2");

  await page.getByText("Security policies").click();
  await setOption(page, "Prevent the instance from being deleted", "false");
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

  await page
    .getByRole("tabpanel", { name: "Configuration" })
    .getByText("Snapshots")
    .click();
  await setInput(page, "Snapshot name", "Enter name pattern", "snap123");
  await setInput(page, "Expire after", "Enter expiry expression", "3m");
  await setOption(page, "Snapshot stopped instances", "true");

  await page.getByText("Cloud init").click();
  await setCodeInput(page, "Network config", "foo:\n" + " - abc");
  await setCodeInput(page, "User data", "bar:\n" + " - def");
  await setCodeInput(page, "Vendor data", "baz:\n" + " - ghi");

  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForSelector(`text=Instance updated.`, TIMEOUT);

  await page.getByText("Resource limits").click();
  await assertReadMode(page, "Memory swap (Containers only)	Allow");
  await assertReadMode(page, "Disk priority 1");
  await assertReadMode(page, "Max number of processes (Containers only) 2");

  await page.getByText("Security policies").click();
  await assertReadMode(page, "Prevent the instance from being deleted No");
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

  await page
    .getByRole("tabpanel", { name: "Configuration" })
    .getByText("Snapshots")
    .click();
  await assertReadMode(page, "Snapshot name pattern snap123");
  await assertReadMode(page, "Expire after 3m");
  await assertReadMode(page, "Snapshot stopped instances Yes");

  await page.getByText("Cloud init").click();
  await assertCode(page, "Network config", "foo:");
  await assertCode(page, "User data", "bar:");
  await assertCode(page, "Vendor data", "baz:");

  await deleteInstance(page, instance);
});
