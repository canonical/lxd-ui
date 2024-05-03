import { test, expect } from "./fixtures/lxd-test";
import {
  toggleIdentitiesForGroups,
  addPermission,
  createGroup,
  deleteGroup,
  renameGroup,
  randomGroupName,
  removePermission,
  restorePermission,
  selectGroupAction,
  visitGroupsPage,
  selectGroupsToModify,
  assertGroupPermissionsCount,
} from "./helpers/permission-groups";
import { identityBar, identityFoo } from "./helpers/permission-identities";
import {
  assertModificationStatus,
  confirmIdentitiesModifiedForGroup,
  redoChange,
  undoChange,
} from "./helpers/permissions";
import { skipIfNotSupported } from "./helpers/permissions";

test("create and delete group", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const group = randomGroupName();
  await visitGroupsPage(page);
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
  await selectGroupAction(page, group, "Manage permissions");
  await addPermission(page, "server", "server", "admin");
  await removePermission(page, "server", "server", "admin");
  await restorePermission(page, "server", "server", "admin");
  await undoChange(page);
  await expect(page.getByText("1 permission will be modified")).toBeHidden();
  await redoChange(page);
  await assertModificationStatus(page, "1 permission will be modified");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForSelector(`text=Permissions for group ${group} updated.`);
  await assertGroupPermissionsCount(page, group, 1);
  await deleteGroup(page, group);
});

test("edit existing permission for group", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const group = randomGroupName();
  await createGroup(page, group, group);
  await selectGroupAction(page, group, "Manage permissions");
  await addPermission(page, "server", "server", "admin");
  await assertModificationStatus(page, "1 permission will be modified");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForSelector(`text=Permissions for group ${group} updated.`);
  await assertGroupPermissionsCount(page, group, 1);
  await selectGroupAction(page, group, "Manage permissions");
  await removePermission(page, "server", "server", "admin");
  await addPermission(page, "project", "default", "can_view");
  await assertModificationStatus(page, "2 permissions will be modified");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForSelector(`text=Permissions for group ${group} updated.`);
  await assertGroupPermissionsCount(page, group, 1);
  await deleteGroup(page, group);
});

test("manage identities for single group", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const group = randomGroupName();
  await createGroup(page, group, group);
  await selectGroupAction(page, group, "Manage identities");
  await toggleIdentitiesForGroups(page, [identityFoo, identityBar]);
  await assertModificationStatus(page, "2 identities will be modified");
  await page.getByRole("button", { name: "Apply 2 identity changes" }).click();
  await confirmIdentitiesModifiedForGroup(page, group, ["foo", "bar"], "added");
  await page.getByRole("button", { name: "Confirm changes" }).click();
  await page.waitForSelector(`text=Updated identities for ${group}`);
  await selectGroupAction(page, group, "Manage identities");
  await toggleIdentitiesForGroups(page, [identityFoo, identityBar]);
  await assertModificationStatus(page, "2 identities will be modified");
  await page.getByRole("button", { name: "Apply 2 identity changes" }).click();
  await confirmIdentitiesModifiedForGroup(
    page,
    group,
    ["foo", "bar"],
    "removed",
  );
  await page.getByRole("button", { name: "Confirm changes" }).click();
  await page.waitForSelector(`text=Updated identities for ${group}`);
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
  await assertModificationStatus(page, "2 identities will be modified");
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
  await assertModificationStatus(page, "2 identities will be modified");
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
  await page.getByLabel("Delete groups").click();
  await page.getByPlaceholder("confirm-delete-group").click();
  await page
    .getByPlaceholder("confirm-delete-group")
    .fill("confirm-delete-group");
  await page
    .getByRole("button", { name: "Permanently delete 2 group" })
    .click();
  await page.waitForSelector(`text=2 groups deleted.`);
});
