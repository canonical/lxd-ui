import { test } from "./fixtures/lxd-test";
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
import { attachVolume, detachVolume } from "./helpers/devices";
import { deleteVolume, randomVolumeName } from "./helpers/storageVolume";

test("instance attach custom volumes and detach inherited volumes", async ({
  page,
}) => {
  const profile = randomProfileName();
  const profileVolume = randomVolumeName();
  const instanceVolume = randomVolumeName();

  await startProfileCreation(page, profile);
  await page.getByRole("button", { name: "Advanced" }).click();
  await page.getByText("Disk devices").click();
  await attachVolume(page, profileVolume, "/foo");
  await finishProfileCreation(page, profile);

  const instance = randomInstanceName();
  await createInstance(page, instance);
  await editInstance(page, instance);
  await page.getByRole("button", { name: "Add profile" }).click();
  await page.locator("#profile-1").selectOption(profile);
  await page.getByText("Disk devices").click();
  await detachVolume(page, "volume-1");
  await attachVolume(page, instanceVolume, "/baz");
  await saveInstance(page, instance);

  await page.getByRole("gridcell", { name: "Detached" }).click();
  await page.getByText("/baz").click();

  await deleteInstance(page, instance);
  await deleteVolume(page, instanceVolume);
  await deleteProfile(page, profile);
  await deleteVolume(page, profileVolume);
});

test("profile edit custom volumes", async ({ page }) => {
  const profile = randomProfileName();
  const volume = randomVolumeName();

  await startProfileCreation(page, profile);
  await page.getByRole("button", { name: "Advanced" }).click();
  await page.getByText("Disk devices").click();
  await page.getByRole("button", { name: "Create override" }).click();
  await page.getByPlaceholder("Enter value").fill("3");
  await attachVolume(page, volume, "/foo");
  await finishProfileCreation(page, profile);

  await visitProfile(page, profile);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Disk devices").click();
  await page.getByRole("row", { name: "Size 3GiB" }).click();
  await page.getByRole("gridcell", { name: volume }).click();
  await page.getByRole("gridcell", { name: "/foo" }).click();

  await page.getByRole("button", { name: "Edit profile" }).click();
  await detachVolume(page, "volume-1");
  await saveProfile(page, profile);

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
  await page.getByRole("button", { name: "Advanced" }).click();
  await page.getByText("Network devices").click();
  await page.getByRole("button", { name: "Attach network" }).click();
  await page.getByPlaceholder("Enter name").fill("eth0");
  await page.getByLabel("Network").selectOption({ index: 1 });
  await finishProfileCreation(page, profile);

  await visitProfile(page, profile);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Network devices").click();
  await page.getByRole("gridcell", { name: "eth0" }).click();

  await page.getByRole("button", { name: "Edit profile" }).click();
  await page.getByRole("button", { name: "Attach network" }).click();
  await page.locator("[id='devices.1.network']").selectOption({ index: 1 });
  await page.locator("[id='devices.1.name']").fill("eth1");
  await saveProfile(page, profile);

  await page.getByRole("gridcell", { name: "eth0" }).click();
  await page.getByRole("gridcell", { name: "eth1" }).click();

  await deleteProfile(page, profile);
});
