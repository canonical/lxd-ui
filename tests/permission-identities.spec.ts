import type { Page } from "@playwright/test";
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
} from "./helpers/permission-identities";
import {
  assertTextVisible,
  confirmGroupsModifiedForIdentity,
  redoChange,
  undoChange,
  skipIfFineGrainedAuthorisationNotSupported,
} from "./helpers/permissions";
import { dismissNotification } from "./helpers/notification";

const getDisplayedToken = async (page: Page): Promise<string> => {
  const token = page.locator(".command-wrapper .command").first();
  await expect(token).toBeVisible();
  const fullToken = await token.getAttribute("title");
  expect(fullToken).toBeTruthy();
  return fullToken ?? "";
};

const closeTokenDisplayModal = async (page: Page) => {
  const copiedCheckbox = page.getByLabel("I have copied the token");
  await expect(copiedCheckbox).toBeVisible();
  await copiedCheckbox.check();
  await page.getByRole("button", { name: "Done" }).click();
};

const waitForTokenIssue = async (page: Page, identityName: string) => {
  const tokenPath = `/1.0/auth/identities/bearer/${encodeURIComponent(identityName)}/token`;
  const response = await page.waitForResponse((res) => {
    return res.request().method() === "POST" && res.url().includes(tokenPath);
  });

  expect(response.ok()).toBeTruthy();
};

const waitForTokenRevoke = async (page: Page, identityName: string) => {
  const tokenPath = `/1.0/auth/identities/bearer/${encodeURIComponent(identityName)}/token`;
  const response = await page.waitForResponse((res) => {
    return res.request().method() === "DELETE" && res.url().includes(tokenPath);
  });

  expect(response.ok()).toBeTruthy();
};

const issueTokenFromEditPanel = async (
  page: Page,
  identityName: string,
): Promise<string> => {
  await page.getByRole("button", { name: "Issue new token" }).click();
  await Promise.all([
    waitForTokenIssue(page, identityName),
    page
      .locator(".p-modal")
      .filter({ hasText: "Issue new token" })
      .getByRole("button", { name: "Issue new token" })
      .click(),
  ]);

  return getDisplayedToken(page);
};

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
    .getByLabel("Manage groups")
    .click();
  await toggleGroupsForIdentities(page, [groupOne, groupTwo]);
  await assertTextVisible(page, "2 groups will be modified");
  await undoChange(page);
  await assertTextVisible(page, "1 group will be modified");
  await redoChange(page);
  await assertTextVisible(page, "2 groups will be modified");
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
    .getByLabel("Manage groups")
    .click();
  await toggleGroupsForIdentities(page, [groupOne, groupTwo]);
  await assertTextVisible(page, "2 groups will be modified");
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

test("revoke token and issue a new token for bearer identity", async ({
  page,
  lxdVersion,
}) => {
  skipIfFineGrainedAuthorisationNotSupported(lxdVersion);

  const identityName = randomIdentityName();
  const identityLabel = `${identityName} (Client token bearer, ${identityName})`;

  try {
    // Create a bearer identity and capture its first token.
    await visitIdentities(page);
    await page.getByRole("button", { name: "Create identity" }).click();
    await page.getByRole("button", { name: "Bearer token (Main API)" }).click();
    await page.getByLabel("Name").fill(identityName);
    await page.getByRole("button", { name: "Create identity" }).click();

    const initialToken = await getDisplayedToken(page);
    await closeTokenDisplayModal(page);

    const identityRow = page.getByRole("row").filter({ hasText: identityName });
    await expect(identityRow).toBeVisible();
    await identityRow.getByLabel("Edit identity").click();

    // Reissue and verify token rotation.
    const reissuedToken = await issueTokenFromEditPanel(page, identityName);
    expect(reissuedToken).not.toEqual(initialToken);
    await dismissNotification(page, `New token issued for ${identityLabel}.`);
    await closeTokenDisplayModal(page);

    // Revoke the active token and ensure the revoke action succeeds.
    await page.getByRole("button", { name: "Revoke token" }).click();
    await Promise.all([
      waitForTokenRevoke(page, identityName),
      page
        .locator(".p-modal")
        .filter({ hasText: "Revoke token" })
        .getByRole("button", { name: "Revoke token" })
        .click(),
    ]);
    await dismissNotification(page, `Token revoked for ${identityLabel}.`);

    // Issue a new token after revoke and confirm it is rotated.
    const tokenAfterRevoke = await issueTokenFromEditPanel(page, identityName);
    expect(tokenAfterRevoke).not.toEqual(reissuedToken);
    await dismissNotification(page, `New token issued for ${identityLabel}.`);
    await closeTokenDisplayModal(page);
  } finally {
    // Clean up identity regardless of assertion outcomes.
    const cleanup = await page.request.delete(
      `/1.0/auth/identities/bearer/${encodeURIComponent(identityName)}`,
    );
    expect([200, 202, 204, 404]).toContain(cleanup.status());
  }
});
