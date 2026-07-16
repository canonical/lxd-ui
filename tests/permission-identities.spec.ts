import { test, expect } from "./fixtures/lxd-test";
import {
  createGroup,
  deleteGroup,
  randomGroupName,
} from "./helpers/permission-groups";
import {
  identityBar,
  identityFoo,
  randomIdentityName,
  selectIdentitiesToModify,
  toggleGroupsForIdentities,
  visitIdentities,
  getDisplayedToken,
  closeTokenDisplayModal,
  issueTokenFromEditPanel,
} from "./helpers/permission-identities";
import {
  assertTextVisible,
  confirmGroupsModifiedForIdentity,
  redoChange,
  undoChange,
  skipIfFineGrainedAuthorisationNotSupported,
  skipIfBearerIdentitiesNotSupported,
} from "./helpers/permissions";
import { dismissNotification } from "./helpers/notification";

test("manage groups for single identity", async ({ page, lxdVersion }) => {
  skipIfFineGrainedAuthorisationNotSupported(lxdVersion);
  // first create some groups
  const groupOne = randomGroupName();
  const groupTwo = randomGroupName();
  await createGroup(page, groupOne, groupOne);
  await createGroup(page, groupTwo, groupTwo);

  await visitIdentities(page);
  await page
    .getByRole("row", { name: `Select ${identityBar} Name ID` })
    .getByLabel("Edit identity")
    .click();
  await toggleGroupsForIdentities(page, [groupOne, groupTwo]);
  await page.getByRole("button", { name: "Save 2 group changes" }).click();

  await confirmGroupsModifiedForIdentity(
    page,
    "bar",
    [groupOne, groupTwo],
    "added",
  );
  await page.getByRole("button", { name: "Confirm changes" }).click();
  await dismissNotification(
    page,
    `Updated groups for bar (OIDC client, ${identityBar}).`,
  );
  await page
    .getByRole("row", { name: `Select ${identityBar} Name ID` })
    .getByLabel("Edit identity")
    .click();
  await toggleGroupsForIdentities(page, [groupOne, groupTwo]);
  await page.getByRole("button", { name: "Save 2 group changes" }).click();
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
  skipIfFineGrainedAuthorisationNotSupported(lxdVersion);
  // first create some groups
  const groupOne = randomGroupName();
  const groupTwo = randomGroupName();
  await createGroup(page, groupOne, groupOne);
  await createGroup(page, groupTwo, groupTwo);

  await visitIdentities(page);
  await selectIdentitiesToModify(page, [identityFoo, identityBar]);
  await page.getByLabel("Modify groups").click();
  await toggleGroupsForIdentities(page, [groupOne, groupTwo]);
  await assertTextVisible(page, "2 groups will be modified");
  await undoChange(page);
  await assertTextVisible(page, "1 group will be modified");
  await redoChange(page);
  await assertTextVisible(page, "2 groups will be modified");
  await page.getByRole("button", { name: "Save 2 group changes" }).click();
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
  await dismissNotification(page, `Updated groups for 2 identities.`);
  await page.getByLabel("Modify groups").click();
  await toggleGroupsForIdentities(page, [groupOne, groupTwo]);
  await assertTextVisible(page, "2 groups will be modified");
  await undoChange(page);
  await assertTextVisible(page, "1 group will be modified");
  await redoChange(page);
  await assertTextVisible(page, "2 groups will be modified");
  await page.getByRole("button", { name: "Save 2 group changes" }).click();
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

test("reissue a new token for bearer identity", async ({
  page,
  lxdVersion,
}) => {
  skipIfFineGrainedAuthorisationNotSupported(lxdVersion);
  skipIfBearerIdentitiesNotSupported(lxdVersion);

  const identity = randomIdentityName();

  // Create a bearer identity and capture its first token.
  await visitIdentities(page);
  await page.getByRole("button", { name: "Create identity" }).click();
  await page.getByRole("button", { name: "Bearer token (Main API)" }).click();
  const sidePanel = page.getByLabel("Side panel");
  await sidePanel.getByPlaceholder("Enter name").fill(identity);
  await sidePanel.getByRole("button", { name: "Create identity" }).click();

  const initialToken = await getDisplayedToken(page);
  await closeTokenDisplayModal(page);

  const identityRow = page.getByRole("row").filter({ hasText: identity });
  await expect(identityRow).toBeVisible();
  const identityType = (
    await identityRow
      .getByRole("cell", { name: "Type", exact: true })
      .textContent()
  )?.trim();
  const identityId = (
    await identityRow
      .getByRole("cell", { name: "ID", exact: true })
      .textContent()
  )?.trim();
  await identityRow.getByLabel("Edit identity").click();

  // Reissue and verify token rotation.
  const reissuedToken = await issueTokenFromEditPanel(page);
  await closeTokenDisplayModal(page);
  expect(reissuedToken).not.toEqual(initialToken);

  await page.getByRole("button", { name: "Cancel" }).click();
  await identityRow.getByLabel("Delete identity").click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await dismissNotification(
    page,
    `Identity ${identity} (${identityType}, ${identityId}) deleted.`,
  );
  await expect(identityRow).not.toBeVisible();
});
