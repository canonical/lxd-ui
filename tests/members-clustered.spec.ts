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
    await page
      .getByRole("dialog", { name: "Confirm restore" })
      .getByRole("button", { name: "Restore cluster member" })
      .click();
    await dismissNotification(page, `Member ${member} restore completed.`);
  }

  await memberRow.hover();
  await memberRow
    .getByRole("button", { name: "Evacuate cluster member" })
    .click();
  await page
    .getByRole("dialog", {
      name: "Confirm evacuation",
    })
    .getByRole("button", { name: "Evacuate cluster member" })
    .click();
  await dismissNotification(page, `Member ${member} evacuation completed.`);

  await memberRow.hover();
  await memberRow.getByRole("button", { name: "Restore" }).click();
  await page
    .getByRole("dialog", { name: "Confirm restore" })
    .getByRole("button", { name: "Restore cluster member" })
    .click();

  await dismissNotification(page, `Member ${member} restore completed.`);
});
