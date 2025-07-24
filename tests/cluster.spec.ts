import { test, expect } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import {
  createClusterGroup,
  deleteClusterGroup,
  getFirstClusterMember,
  randomGroupName,
  skipIfNotSupported,
  toggleClusterGroupMember,
} from "./helpers/cluster";

test("cluster group create and delete", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const group = randomGroupName();
  await createClusterGroup(page, group);
  await deleteClusterGroup(page, group);
});

test("cluster group add and remove members", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const group = randomGroupName();
  const member = await getFirstClusterMember(page);
  await createClusterGroup(page, group);
  await toggleClusterGroupMember(page, group, member);

  await expect(
    page.getByRole("row", { name: group }).getByText("1"),
  ).toBeVisible();

  await toggleClusterGroupMember(page, group, member);

  await expect(
    page.getByRole("row", { name: group }).getByText("0"),
  ).toBeVisible();

  await deleteClusterGroup(page, group);
});

test("cluster member evacuate and restore", async ({ page, lxdVersion }) => {
  skipIfNotSupported(lxdVersion);
  const member = await getFirstClusterMember(page);

  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Members" }).click();
  const memberRow = page.getByRole("row").filter({ hasText: member });

  await memberRow.hover();
  const restoreBtn = memberRow.getByRole("button", { name: "Restore" });
  if (await restoreBtn.isEnabled()) {
    await restoreBtn.click();
    await page.getByRole("button", { name: "Restore member" }).click();
    await page.waitForSelector(`text=Member ${member} restore completed.`);
  }

  await memberRow.hover();
  await memberRow.getByRole("button", { name: "Evacuate" }).click();
  await page.getByText("Evacuate member").click();

  await page.waitForSelector(`text=Member ${member} evacuation completed.`);

  await memberRow.hover();
  await memberRow.getByRole("button", { name: "Restore" }).click();
  await page.getByText("Restore member").click();

  await page.waitForSelector(`text=Member ${member} restore completed.`);
});
