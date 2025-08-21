import { test } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import {
  getFirstClusterMember,
  skipIfNotClustered,
  skipIfNotSupported,
} from "./helpers/cluster";

test("cluster member evacuate and restore", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);
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
