import { test } from "./fixtures/lxd-test";
import { skipIfNotSupported } from "./helpers/cluster-groups";
import { getFirstClusterMember, skipIfNotClustered } from "./helpers/cluster";
import { dismissNotification } from "./helpers/notification";

test("cluster member evacuate and restore", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);
  const member = await getFirstClusterMember(page);
  const memberRow = page.getByRole("row").filter({ hasText: member });

  await memberRow.hover();
  const restoreBtn = memberRow.getByRole("button", { name: "Restore" });
  if (await restoreBtn.isEnabled()) {
    await restoreBtn.click();
    await page.getByText("Restore cluster member", { exact: true }).click();
    await dismissNotification(page, `Member ${member} restore completed.`);
  }

  await memberRow.hover();
  await memberRow.getByRole("button", { name: "Evacuate" }).click();
  await page.getByText("Evacuate cluster member", { exact: true }).click();

  await dismissNotification(page, `Member ${member} evacuation completed.`);

  await memberRow.hover();
  await memberRow.getByRole("button", { name: "Restore" }).click();
  await page.getByText("Restore cluster member", { exact: true }).click();

  await dismissNotification(page, `Member ${member} restore completed.`);
});
