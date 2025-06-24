import { test } from "./fixtures/lxd-test";
import {
  toggleIdentitiesForGroups,
  addPermission,
  createGroup,
  deleteGroup,
  renameGroup,
  randomGroupName,
  removePermission,
  restorePermission,
  visitGroups,
  selectGroupsToModify,
  assertGroupPermissionsCount,
  openEditGroupPanel,
} from "./helpers/permission-groups";
import { identityBar, identityFoo } from "./helpers/permission-identities";
import {
  assertTextVisible,
  confirmIdentitiesModifiedForGroup,
} from "./helpers/permissions";
import { skipIfNotSupported } from "./helpers/permissions";

test("create and delete group", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const group = randomGroupName();
  await visitGroups(page);
  await createGroup(page, group, `${group}-desc`);
  await deleteGroup(page, group);
});

test("edit and rename group", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const group = randomGroupName();
  const newGroupName = randomGroupName();
  await createGroup(page, group, group);
  await renameGroup(page, group, newGroupName);
  await renameGroup(page, newGroupName, group);
  await deleteGroup(page, group);
});

test("add new permissions to group", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const group = randomGroupName();
  await createGroup(page, group, group);
  await openEditGroupPanel(page, group);
  await page.getByRole("button", { name: "Edit permissions" }).click();
  await addPermission(page, "Server", "server", "admin");
  await page.getByText("Edit group").click();
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await page.waitForSelector(`text=Group ${group} updated.`);
  await assertGroupPermissionsCount(page, group, 1);
  await deleteGroup(page, group);
});

test("edit existing permission for group", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const group = randomGroupName();
  await createGroup(page, group, group);
  await openEditGroupPanel(page, group);
  await page.getByRole("button", { name: "Edit permissions" }).click();
  await addPermission(page, "Server", "server", "admin");
  await page.getByText("Edit group").click();
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await page.waitForSelector(`text=Group ${group} updated.`);
  await assertGroupPermissionsCount(page, group, 1);
  await openEditGroupPanel(page, group);
  await page.getByRole("button", { name: "Edit permissions" }).click();
  await removePermission(page, "server", "server", "admin");
  await restorePermission(page, "server", "server", "admin");
  await removePermission(page, "server", "server", "admin");
  await addPermission(page, "Project", "default", "can_view");
  await page.getByText("Edit group").click();
  await page.getByRole("button", { name: "Save 2 changes" }).click();
  await page.waitForSelector(`text=Group ${group} updated.`);
  await assertGroupPermissionsCount(page, group, 1);
  await deleteGroup(page, group);
});

test("manage identities for single group", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const group = randomGroupName();
  await createGroup(page, group, group);
  await openEditGroupPanel(page, group);
  await page.getByRole("button", { name: "Edit identities" }).click();
  await toggleIdentitiesForGroups(page, [identityFoo, identityBar]);
  await page.getByText("Edit group").click();
  await page.getByRole("button", { name: "Save 2 changes" }).click();
  await page.waitForSelector(`text=Group ${group} updated.`);
  await openEditGroupPanel(page, group);
  await page.getByRole("button", { name: "Edit identities" }).click();
  await toggleIdentitiesForGroups(page, [identityFoo, identityBar]);
  await page.getByText("Edit group").click();
  await page.getByRole("button", { name: "Save 2 changes" }).click();
  await page.waitForSelector(`text=Group ${group} updated.`);
  await deleteGroup(page, group);
});

test("manage identities for many groups", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const groupOne = randomGroupName();
  const groupTwo = randomGroupName();
  await createGroup(page, groupOne, groupOne);
  await createGroup(page, groupTwo, groupTwo);
  await selectGroupsToModify(page, [groupOne, groupTwo]);
  await page.getByRole("button", { name: "Manage identities" }).click();
  await toggleIdentitiesForGroups(page, [identityFoo, identityBar]);
  await assertTextVisible(page, "2 identities will be modified");
  await page.getByRole("button", { name: "Apply 2 identity changes" }).click();
  await confirmIdentitiesModifiedForGroup(
    page,
    groupOne,
    ["foo", "bar"],
    "added",
  );
  await confirmIdentitiesModifiedForGroup(
    page,
    groupTwo,
    ["foo", "bar"],
    "added",
  );
  await page.getByRole("button", { name: "Confirm changes" }).click();
  await page.waitForSelector(`text=Updated identities for 2 groups`);
  await page.getByRole("button", { name: "Manage identities" }).click();
  await toggleIdentitiesForGroups(page, [identityFoo, identityBar]);
  await assertTextVisible(page, "2 identities will be modified");
  await page.getByRole("button", { name: "Apply 2 identity changes" }).click();
  await confirmIdentitiesModifiedForGroup(
    page,
    groupOne,
    ["foo", "bar"],
    "removed",
  );
  await confirmIdentitiesModifiedForGroup(
    page,
    groupTwo,
    ["foo", "bar"],
    "removed",
  );
  await deleteGroup(page, groupOne);
  await deleteGroup(page, groupTwo);
});

test("bulk delete groups", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const groupOne = randomGroupName();
  const groupTwo = randomGroupName();
  await createGroup(page, groupOne, groupOne);
  await createGroup(page, groupTwo, groupTwo);
  await selectGroupsToModify(page, [groupOne, groupTwo]);
  await page.getByRole("button", { name: "Delete 2 groups" }).click();
  await page.getByPlaceholder("confirm-delete-group").click();
  await page
    .getByPlaceholder("confirm-delete-group")
    .fill("confirm-delete-group");
  await page
    .getByRole("button", { name: "Permanently delete 2 group" })
    .click();
  await page.waitForSelector(`text=2 groups deleted.`);
});

test("create group with permissions", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const group = randomGroupName();
  await visitGroups(page);
  const withPermission = true;
  await createGroup(page, group, `${group}-desc`, withPermission);
  await deleteGroup(page, group);
});
