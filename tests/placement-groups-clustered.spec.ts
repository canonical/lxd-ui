import { expect, test } from "./fixtures/lxd-test";
import {
  createPlacementGroup,
  deletePlacementGroup,
  editPlacementGroup,
  randomPlacementGroupName,
  skipIfNotSupported,
} from "./helpers/placement-groups";
import {
  createProfile,
  deleteProfile,
  editProfile,
  randomProfileName,
  saveProfile,
  visitProfile,
} from "./helpers/profile";
import {
  createInstance,
  deleteInstance,
  editInstance,
  randomInstanceName,
  saveInstance,
  visitInstance,
} from "./helpers/instances";
import { skipIfNotClustered } from "./helpers/cluster";

test("placement group create, edit, delete", async ({
  lxdVersion,
  page,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);
  const placementGroup = randomPlacementGroupName();

  await createPlacementGroup(page, placementGroup);
  await editPlacementGroup(page, placementGroup);
  await deletePlacementGroup(page, placementGroup);
});

test("apply placement group to profile", async ({
  lxdVersion,
  page,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);
  const placementGroup = randomPlacementGroupName();
  const profile = randomProfileName();

  await createPlacementGroup(page, placementGroup);
  await createProfile(page, profile);
  await editProfile(page, profile);
  await page
    .getByRole("button", { name: "Placement group", exact: true })
    .click();
  await page
    .getByLabel("sub")
    .getByText(placementGroup, { exact: true })
    .click();
  await saveProfile(page, profile, 1);
  await visitProfile(page, profile);
  await expect(page.getByText(placementGroup)).toBeVisible();
  await deleteProfile(page, profile);
  await deletePlacementGroup(page, placementGroup);
});

test("apply placement group to instance", async ({
  lxdVersion,
  page,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);
  const placementGroup = randomPlacementGroupName();
  const instance = randomInstanceName();

  await createPlacementGroup(page, placementGroup);
  await createInstance(page, instance);
  await editInstance(page, instance);
  await page
    .getByRole("button", { name: "Placement group", exact: true })
    .click();
  await page
    .getByLabel("sub")
    .getByText(placementGroup, { exact: true })
    .click();
  await saveInstance(page, instance, 1);
  await visitInstance(page, instance);
  await expect(page.getByText(placementGroup)).toBeVisible();
  await deleteInstance(page, instance);
  await deletePlacementGroup(page, placementGroup);
});
