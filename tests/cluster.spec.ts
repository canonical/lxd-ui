import { test } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import {
  createClusterGroup,
  deleteClusterGroup,
  getFirstClusterMember,
  randomGroupName,
  toggleClusterGroupMember,
} from "./helpers/cluster";

test("cluster group create and delete", async ({ page }) => {
  const group = randomGroupName();
  await createClusterGroup(page, group);
  await deleteClusterGroup(page, group);
});

test("cluster group add and remove members", async ({ page }) => {
  const group = randomGroupName();
  const member = await getFirstClusterMember(page);
  await createClusterGroup(page, group);
  await toggleClusterGroupMember(page, group, member);

  await gotoURL(page, "/ui/");
  await page.getByRole("link", { name: "Cluster" }).click();
  await page.getByRole("button", { name: "All cluster groups" }).click();
  await page.getByRole("link", { name: group }).click();
  await page.waitForSelector(`text=${member}`);

  await toggleClusterGroupMember(page, group, member);
  await deleteClusterGroup(page, group);
});

test("cluster member evacuate and restore", async ({ page }) => {
  const member = await getFirstClusterMember(page);

  await gotoURL(page, "/ui/");
  await page.getByRole("link", { name: "Cluster" }).click();
  const memberRow = page.getByRole("row").filter({ hasText: member });

  await memberRow.hover();
  const restoreBtn = memberRow.getByRole("button", { name: "Restore" });
  if (await restoreBtn.isVisible()) {
    await restoreBtn.click();
    await page.getByRole("button", { name: "Restore member" }).click();
    await page.waitForSelector(`text=Member ${member} restore completed.`);
  }

  await memberRow.hover();
  await memberRow.getByRole("button", { name: "Evacuate" }).click();
  await page.getByRole("button", { name: "Evacuate member" }).click();

  await page.waitForSelector(`text=Member ${member} evacuation completed.`);

  await memberRow.hover();
  await memberRow.getByRole("button", { name: "Restore" }).click();
  await page.getByRole("button", { name: "Restore member" }).click();

  await page.waitForSelector(`text=Member ${member} restore completed.`);
});
