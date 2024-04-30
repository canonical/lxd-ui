import { test, expect, LxdVersions } from "./fixtures/lxd-test";
import {
  toggleIdentities,
  addPermission,
  createGroup,
  deleteGroup,
  editGroup,
  randomGroupName,
  removePermission,
  restorePermission,
  selectGroupAction,
  visitGroupsPage,
  selectGroups,
} from "./helpers/auth-groups";
import {
  identityBar,
  identityFoo,
  selectIdentities,
  toggleGroups,
  visitIdentitiesPage,
} from "./helpers/auth-identities";
import {
  createIdpGroup,
  deleteIdpGroup,
  editIdpGroup,
  randomIdpGroupName,
  visitIdpGroupsPage,
} from "./helpers/auth-idp-groups";
import {
  assertModificationStatus,
  confirmGroupsModifiedForIdentity,
  confirmIdentitiesModifiedForGroup,
  redoChange,
  undoChange,
} from "./helpers/auth";
import {
  resetSetting,
  updateSetting,
  visitServerSettings,
} from "./helpers/server";

const skipPermissionTest = (lxdVersion: LxdVersions) =>
  test.skip(
    lxdVersion === "5.0-edge",
    "Fine grained authorisation is not available for lxd 5.0",
  );

test("LXD 5.0 does not support permissions", async ({ page, lxdVersion }) => {
  test.skip(
    lxdVersion !== "5.0-edge",
    "Fine grained authorisation is supported in lxd 5.21 LTS and latest/edge",
  );
  await page.goto("/ui/");
  await expect(page.getByRole("button", { name: "Permissions" })).toBeHidden();
});

test.describe("Permission groups", () => {
  test("create and delete group", async ({ page, lxdVersion }) => {
    skipPermissionTest(lxdVersion);
    const group = randomGroupName();
    await visitGroupsPage(page);
    await createGroup(page, group, `${group}-desc`);
    await deleteGroup(page, group);
  });

  test("edit and rename group", async ({ page, lxdVersion }) => {
    skipPermissionTest(lxdVersion);
    const group = randomGroupName();
    const renameGroup = randomGroupName();
    await createGroup(page, group, group);
    await editGroup(page, group, renameGroup, renameGroup);
    await editGroup(page, renameGroup, group, group);
    await deleteGroup(page, group);
  });

  test("add new permissions to group", async ({ page, lxdVersion }) => {
    skipPermissionTest(lxdVersion);
    const group = randomGroupName();
    await createGroup(page, group, group);
    await selectGroupAction(page, group, "Manage permissions");
    await addPermission(page, "server", "server", "admin");
    await removePermission(page, "server", "server", "admin");
    await restorePermission(page, "server", "server", "admin");
    await undoChange(page);
    await redoChange(page);
    await assertModificationStatus(page, "1 permission will be modified");
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.waitForSelector(`text=Permissions for group ${group} updated.`);
    await deleteGroup(page, group);
  });

  test("edit existing permission for group", async ({ page, lxdVersion }) => {
    skipPermissionTest(lxdVersion);
    const group = randomGroupName();
    await createGroup(page, group, group);
    await selectGroupAction(page, group, "Manage permissions");
    await addPermission(page, "server", "server", "admin");
    await assertModificationStatus(page, "1 permission will be modified");
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.waitForSelector(`text=Permissions for group ${group} updated.`);
    await selectGroupAction(page, group, "Manage permissions");
    await removePermission(page, "server", "server", "admin");
    await addPermission(page, "project", "default", "can_view");
    await assertModificationStatus(page, "2 permissions will be modified");
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.waitForSelector(`text=Permissions for group ${group} updated.`);
    await deleteGroup(page, group);
  });

  test("manage identities for single group", async ({ page, lxdVersion }) => {
    skipPermissionTest(lxdVersion);
    const group = randomGroupName();
    await createGroup(page, group, group);
    await selectGroupAction(page, group, "Manage identities");
    await toggleIdentities(page, [identityFoo, identityBar]);
    await assertModificationStatus(page, "2 identities will be modified");
    await page
      .getByRole("button", { name: "Apply 2 identity changes" })
      .click();
    await confirmIdentitiesModifiedForGroup(
      page,
      group,
      ["foo", "bar"],
      "added",
    );
    await page.getByRole("button", { name: "Confirm changes" }).click();
    await page.waitForSelector(`text=Updated identities for ${group}`);
    await selectGroupAction(page, group, "Manage identities");
    await toggleIdentities(page, [identityFoo, identityBar]);
    await assertModificationStatus(page, "2 identities will be modified");
    await page
      .getByRole("button", { name: "Apply 2 identity changes" })
      .click();
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
    skipPermissionTest(lxdVersion);
    const groupOne = randomGroupName();
    const groupTwo = randomGroupName();
    await createGroup(page, groupOne, groupOne);
    await createGroup(page, groupTwo, groupTwo);
    await selectGroups(page, [groupOne, groupTwo]);
    await page.getByRole("button", { name: "Manage identities" }).click();
    await toggleIdentities(page, [identityFoo, identityBar]);
    await assertModificationStatus(page, "2 identities will be modified");
    await page
      .getByRole("button", { name: "Apply 2 identity changes" })
      .click();
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
    await toggleIdentities(page, [identityFoo, identityBar]);
    await assertModificationStatus(page, "2 identities will be modified");
    await page
      .getByRole("button", { name: "Apply 2 identity changes" })
      .click();
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
    skipPermissionTest(lxdVersion);
    const groupOne = randomGroupName();
    const groupTwo = randomGroupName();
    await createGroup(page, groupOne, groupOne);
    await createGroup(page, groupTwo, groupTwo);
    await selectGroups(page, [groupOne, groupTwo]);
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
});

test.describe("Permission identities", () => {
  test("manage groups for single identity", async ({ page, lxdVersion }) => {
    skipPermissionTest(lxdVersion);
    // first create some groups
    const groupOne = randomGroupName();
    const groupTwo = randomGroupName();
    await createGroup(page, groupOne, groupOne);
    await createGroup(page, groupTwo, groupTwo);

    await visitIdentitiesPage(page);
    await page
      .getByRole("row", { name: `Select ${identityBar} Name ID` })
      .getByLabel("Manage groups")
      .click();
    await toggleGroups(page, [groupOne, groupTwo]);
    await assertModificationStatus(page, "2 groups will be modified");
    await undoChange(page);
    await assertModificationStatus(page, "1 group will be modified");
    await redoChange(page);
    await assertModificationStatus(page, "2 groups will be modified");
    await page.getByRole("button", { name: "Apply 2 group changes" }).click();
    await confirmGroupsModifiedForIdentity(
      page,
      "bar",
      [groupOne, groupTwo],
      "added",
    );
    await page.getByRole("button", { name: "Confirm changes" }).click();
    await page.waitForSelector(`text=Updated groups for bar`);
    await page
      .getByRole("row", { name: `Select ${identityBar} Name ID` })
      .getByLabel("Manage groups")
      .click();
    await toggleGroups(page, [groupOne, groupTwo]);
    await assertModificationStatus(page, "2 groups will be modified");
    await page.getByRole("button", { name: "Apply 2 group changes" }).click();
    await confirmGroupsModifiedForIdentity(
      page,
      "bar",
      [groupOne, groupTwo],
      "removed",
    );
    await deleteGroup(page, groupOne);
    await deleteGroup(page, groupTwo);
  });

  test("manage groups for many identities", async ({ page, lxdVersion }) => {
    skipPermissionTest(lxdVersion);
    // first create some groups
    const groupOne = randomGroupName();
    const groupTwo = randomGroupName();
    await createGroup(page, groupOne, groupOne);
    await createGroup(page, groupTwo, groupTwo);

    await visitIdentitiesPage(page);
    await selectIdentities(page, [identityFoo, identityBar]);
    await page.getByLabel("Modify groups").click();
    await toggleGroups(page, [groupOne, groupTwo]);
    await assertModificationStatus(page, "2 groups will be modified");
    await page.getByRole("button", { name: "Apply 2 group changes" }).click();
    await confirmGroupsModifiedForIdentity(
      page,
      "foo",
      [groupOne, groupTwo],
      "added",
    );
    await confirmGroupsModifiedForIdentity(
      page,
      "bar",
      [groupOne, groupTwo],
      "added",
    );
    await page.getByRole("button", { name: "Confirm changes" }).click();
    await page.waitForSelector(`text=Updated groups for 2 identities`);
    await page.getByLabel("Modify groups").click();
    await toggleGroups(page, [groupOne, groupTwo]);
    await assertModificationStatus(page, "2 groups will be modified");
    await page.getByRole("button", { name: "Apply 2 group changes" }).click();
    await confirmGroupsModifiedForIdentity(
      page,
      "foo",
      [groupOne, groupTwo],
      "removed",
    );
    await confirmGroupsModifiedForIdentity(
      page,
      "bar",
      [groupOne, groupTwo],
      "removed",
    );
    await deleteGroup(page, groupOne);
    await deleteGroup(page, groupTwo);
  });
});

test.describe("Permission IDP groups", () => {
  test("create and delete idp group", async ({ page, lxdVersion }) => {
    skipPermissionTest(lxdVersion);
    // first create some groups
    const groupOne = randomGroupName();
    const groupTwo = randomGroupName();
    await createGroup(page, groupOne, groupOne);
    await createGroup(page, groupTwo, groupTwo);

    const idpGroup = randomIdpGroupName();
    await createIdpGroup(page, idpGroup, [groupOne, groupTwo]);
    await deleteIdpGroup(page, idpGroup);
    await deleteGroup(page, groupOne);
    await deleteGroup(page, groupTwo);
  });

  test("edit idp group", async ({ page, lxdVersion }) => {
    skipPermissionTest(lxdVersion);
    const groupOne = randomGroupName();
    const groupTwo = randomGroupName();
    const groupThree = randomGroupName();
    const groupFour = randomGroupName();
    await createGroup(page, groupOne, groupOne);
    await createGroup(page, groupTwo, groupTwo);
    await createGroup(page, groupThree, groupThree);
    await createGroup(page, groupFour, groupFour);

    const oldIdpGroupName = randomIdpGroupName();
    const newIdpGroupName = randomIdpGroupName();
    await createIdpGroup(page, oldIdpGroupName, [groupOne, groupTwo]);
    await editIdpGroup(page, oldIdpGroupName, newIdpGroupName, [
      groupThree,
      groupFour,
    ]);
    await deleteIdpGroup(page, newIdpGroupName);
    await deleteGroup(page, groupOne);
    await deleteGroup(page, groupTwo);
    await deleteGroup(page, groupThree);
    await deleteGroup(page, groupFour);
  });

  test("bulk delete idp groups", async ({ page, lxdVersion }) => {
    skipPermissionTest(lxdVersion);
    const groupOne = randomGroupName();
    const groupTwo = randomGroupName();
    await createGroup(page, groupOne, groupOne);
    await createGroup(page, groupTwo, groupTwo);

    const idpGroupOne = randomIdpGroupName();
    const idpGroupTwo = randomIdpGroupName();
    await createIdpGroup(page, idpGroupOne, [groupOne, groupTwo]);
    await createIdpGroup(page, idpGroupTwo, [groupOne, groupTwo]);
    await page
      .getByRole("row", { name: `Select ${idpGroupOne}` })
      .locator("span")
      .click();
    await page
      .getByRole("row", { name: `Select ${idpGroupTwo}` })
      .locator("span")
      .click();
    await page.getByLabel("Delete IDP groups").click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await page.waitForSelector(`text=2 IDP groups deleted.`);
    await deleteGroup(page, groupOne);
    await deleteGroup(page, groupTwo);
  });

  test("show different idp groups notification if oidc.groups.claim is set", async ({
    page,
    lxdVersion,
  }) => {
    skipPermissionTest(lxdVersion);
    await visitServerSettings(page);
    await updateSetting(page, "oidc.groups.claim", "text", "test");
    await visitIdpGroupsPage(page);
    const configurationLink = page.getByRole("link", {
      name: "configuration (oidc.groups.claim)",
    });
    await expect(configurationLink).toBeHidden();
    await visitServerSettings(page);
    await resetSetting(page, "oidc.groups.claim", "text", "-");
    await visitIdpGroupsPage(page);
    await expect(configurationLink).toBeVisible();
  });
});
