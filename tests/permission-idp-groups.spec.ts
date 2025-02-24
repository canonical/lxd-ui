import { test, expect } from "./fixtures/lxd-test";
import {
  createGroup,
  deleteGroup,
  randomGroupName,
} from "./helpers/permission-groups";
import {
  createIdpGroup,
  deleteIdpGroup,
  editIdpGroup,
  randomIdpGroupName,
  visitIdpGroups,
} from "./helpers/permission-idp-groups";
import { skipIfNotSupported } from "./helpers/permissions";
import {
  getServerSettingValue,
  resetSetting,
  updateSetting,
  visitServerSettings,
} from "./helpers/server";

test("create and delete idp group", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
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
  skipIfNotSupported(lxdVersion);
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
  skipIfNotSupported(lxdVersion);
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
  await page.getByRole("button", { name: "Delete 2 IDP groups" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.waitForSelector(`text=2 IDP groups deleted.`);
  await deleteGroup(page, groupOne);
  await deleteGroup(page, groupTwo);
});

test("show different idp groups notification if oidc.groups.claim is set", async ({
  page,
  lxdVersion,
}) => {
  skipIfNotSupported(lxdVersion);
  await visitServerSettings(page);
  const settingName = "oidc.groups.claim";
  const initialSettingValue = await getServerSettingValue(page, settingName);
  await updateSetting(page, settingName, "text", "test");
  await visitIdpGroups(page);
  const configurationLink = page.getByRole("link", {
    name: "configuration (oidc.groups.claim)",
  });
  await expect(configurationLink).toBeHidden();
  await visitServerSettings(page);
  await resetSetting(page, settingName, "text", "-");
  await visitIdpGroups(page);
  await expect(configurationLink).toBeVisible();
  await visitServerSettings(page);
  await updateSetting(page, settingName, "text", initialSettingValue || "-");
});
