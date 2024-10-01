import { expect, test } from "./fixtures/lxd-test";
import {
  deleteProfile,
  finishProfileCreation,
  randomProfileName,
  saveProfile,
  visitProfile,
  startProfileCreation,
} from "./helpers/profile";
import {
  createInstance,
  deleteInstance,
  editInstance,
  randomInstanceName,
  saveInstance,
} from "./helpers/instances";
import {
  attachVolume,
  detachVolume,
  visitProfileGPUDevices,
  visitProfileOtherDevices,
} from "./helpers/devices";
import { deleteVolume, randomVolumeName } from "./helpers/storageVolume";
import { assertTextVisible } from "./helpers/permissions";

test("instance attach custom volumes and detach inherited volumes", async ({
  page,
}) => {
  const profile = randomProfileName();
  const profileVolume = randomVolumeName();
  const instanceVolume = randomVolumeName();

  await startProfileCreation(page, profile);
  await page.getByText("Disk", { exact: true }).click();
  await attachVolume(page, profileVolume, "/foo");
  await finishProfileCreation(page, profile);

  const instance = randomInstanceName();
  await createInstance(page, instance);
  await editInstance(page, instance);
  await page.getByRole("button", { name: "Add profile" }).click();
  await page.locator("#profile-1").selectOption(profile);
  await page.getByText("Disk", { exact: true }).click();
  await detachVolume(page, "volume-1");
  await attachVolume(page, instanceVolume, "/baz");
  await saveInstance(page, instance, 3);

  await assertTextVisible(page, "Reattach");
  await assertTextVisible(page, "/baz");

  await deleteInstance(page, instance);
  await deleteVolume(page, instanceVolume);
  await deleteProfile(page, profile);
  await deleteVolume(page, profileVolume);
});

test("profile edit custom volumes", async ({ page }) => {
  const profile = randomProfileName();
  const volume = randomVolumeName();

  await startProfileCreation(page, profile);
  await page.getByText("Disk", { exact: true }).click();
  await page.getByRole("button", { name: "Create override" }).click();
  await page.getByPlaceholder("Enter value").fill("3");
  await attachVolume(page, volume, "/foo");
  await finishProfileCreation(page, profile);

  await visitProfile(page, profile);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Disk", { exact: true }).click();
  await page.getByRole("row", { name: "Size 3GiB" }).click();
  await page.getByRole("gridcell", { name: volume }).click();
  await page.getByRole("gridcell", { name: "/foo" }).click();

  await detachVolume(page, "volume-1");
  await saveProfile(page, profile, 1);

  await page.getByRole("row", { name: "Size 3GiB" }).click();

  const volumeVisible = await page
    .getByRole("gridcell", { name: volume })
    .isVisible();
  test.fail(volumeVisible, "Volume is still present");

  await deleteProfile(page, profile);
  await deleteVolume(page, volume);
});

test("profile edit networks", async ({ page }) => {
  const profile = randomProfileName();

  await startProfileCreation(page, profile);
  await page.getByText("Network", { exact: true }).click();
  await page.getByRole("button", { name: "Attach network" }).click();
  await page.getByPlaceholder("Enter name").fill("eth0");
  await page.getByLabel("Network").selectOption({ index: 1 });
  await finishProfileCreation(page, profile);

  await visitProfile(page, profile);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Network", { exact: true }).click();
  await page.getByRole("gridcell", { name: "eth0" }).click();

  await page.getByRole("button", { name: "Attach network" }).click();
  await page.locator("[id='devices.1.network']").selectOption({ index: 1 });
  await page.locator("[id='devices.1.name']").fill("eth1");
  await saveProfile(page, profile, 1);

  await page.getByRole("gridcell", { name: "eth0" }).click();
  await page.getByRole("gridcell", { name: "eth1" }).click();

  await deleteProfile(page, profile);
});

test("add, edit and remove a GPU device", async ({ page }) => {
  const profile = randomProfileName();

  // Add GPU Device
  await startProfileCreation(page, profile);
  await page.getByText("GPU", { exact: true }).click();
  await page.getByRole("button", { name: "Attach GPU" }).click();
  await page.getByRole("button", { name: "Enter details manually" }).click();
  await page.getByRole("textbox", { name: "ID" }).fill("23");
  await finishProfileCreation(page, profile);

  await visitProfileGPUDevices(page, profile);
  await expect(page.getByRole("textbox", { name: "ID" })).toHaveValue("23");

  // Edit and save GPU Device
  await page.getByRole("textbox", { name: "ID" }).fill("42");
  await saveProfile(page, profile, 1);

  // Refresh to check values after edit
  await visitProfileGPUDevices(page, profile);
  await expect(page.getByRole("textbox", { name: "ID" })).toHaveValue("42");

  // Detach GPU Device
  await page.getByRole("button", { name: "Detach" }).click();
  await saveProfile(page, profile, 1);
  await visitProfileGPUDevices(page, profile);
  await expect(page.getByRole("textbox", { name: "ID" })).not.toBeVisible();

  await deleteProfile(page, profile);
});

test("add, edit and remove a proxy device", async ({ page }) => {
  const profile = randomProfileName();

  //Add Proxy Device
  await startProfileCreation(page, profile);
  await page.getByText("Proxy", { exact: true }).click();
  await page.getByRole("button", { name: "New Proxy Device" }).click();
  await page.getByLabel("Bind").selectOption({ index: 2 });
  await page.getByLabel("Address").first().fill("127.0.0.1");
  await page.getByLabel("Port").first().fill("3000");
  await page.getByLabel("Address").nth(1).fill("127.0.0.2");
  await page.getByLabel("Port").nth(1).fill("3001");
  await finishProfileCreation(page, profile);

  //Edit and save Proxy Device
  await visitProfile(page, profile);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Proxy", { exact: true }).click();
  await page.getByLabel("Address").first().fill("127.0.0.3");
  await saveProfile(page, profile, 1);

  //Edit and save Proxy Device (Refresh)
  await visitProfile(page, profile);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Proxy", { exact: true }).click();
  await expect(page.getByLabel("Address").first()).toHaveValue("127.0.0.3");
  await expect(page.getByLabel("Address").nth(1)).toHaveValue("127.0.0.2");
  await expect(page.getByLabel("Port").first()).toHaveValue("3000");
  await expect(page.getByLabel("Port").nth(1)).toHaveValue("3001");
  await expect(page.getByLabel("Type").first()).toBeVisible();
  await expect(page.getByLabel("Type").first()).toHaveValue("tcp");

  //Delete Proxy Device
  await visitProfile(page, profile);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Proxy", { exact: true }).click();
  await page.getByRole("button", { name: "Detach" }).click();
  await saveProfile(page, profile, 1);
  await visitProfile(page, profile);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Proxy", { exact: true }).click();
  await expect(page.getByLabel("Address").first()).not.toBeVisible();
});

test("add, edit and remove an other device", async ({ page, lxdVersion }) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "Other device configuration not supported in lxd v5.0/edge",
  );
  const profile = randomProfileName();

  // Add Other Device
  await startProfileCreation(page, profile);
  await page.getByText("Other", { exact: true }).click();
  await page.getByRole("button", { name: "Attach custom device" }).click();
  await page.getByLabel("Type").selectOption("USB");
  await page.getByLabel("Bus Number").fill("123");
  await page.getByLabel("Device Number").fill("12345");
  await finishProfileCreation(page, profile);

  // Edit and save Other Device
  await visitProfileOtherDevices(page, profile);
  await page.getByLabel("Device Number").fill("123456");
  await saveProfile(page, profile, 1);

  // Refresh to check values after edit
  await visitProfileOtherDevices(page, profile);
  await expect(page.getByLabel("Type")).toHaveValue("usb");
  await expect(page.getByLabel("Bus Number")).toHaveValue("123");
  await expect(page.getByLabel("Device Number")).toHaveValue("123456");

  // Detach Other Device
  await visitProfileOtherDevices(page, profile);
  await page.getByRole("button", { name: "Detach" }).click();
  await saveProfile(page, profile, 1);
  await visitProfileOtherDevices(page, profile);
  await expect(page.getByLabel("Type")).not.toBeVisible();

  await deleteProfile(page, profile);
});
