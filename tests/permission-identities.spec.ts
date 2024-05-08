import { test } from "./fixtures/lxd-test";
import {
  createGroup,
  deleteGroup,
  randomGroupName,
} from "./helpers/permission-groups";
import {
  identityBar,
  identityFoo,
  selectIdentitiesToModify,
  toggleGroupsForIdentities,
  visitIdentitiesPage,
} from "./helpers/permission-identities";
import {
  assertModificationStatus,
  confirmGroupsModifiedForIdentity,
  redoChange,
  undoChange,
} from "./helpers/permissions";
import { skipIfNotSupported } from "./helpers/permissions";

test("manage groups for single identity", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
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
  await toggleGroupsForIdentities(page, [groupOne, groupTwo]);
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
  await toggleGroupsForIdentities(page, [groupOne, groupTwo]);
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
  skipIfNotSupported(lxdVersion);
  // first create some groups
  const groupOne = randomGroupName();
  const groupTwo = randomGroupName();
  await createGroup(page, groupOne, groupOne);
  await createGroup(page, groupTwo, groupTwo);

  await visitIdentitiesPage(page);
  await selectIdentitiesToModify(page, [identityFoo, identityBar]);
  await page.getByLabel("Modify groups").click();
  await toggleGroupsForIdentities(page, [groupOne, groupTwo]);
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
  await toggleGroupsForIdentities(page, [groupOne, groupTwo]);
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
