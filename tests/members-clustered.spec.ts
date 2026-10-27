import { expect, test } from "./fixtures/lxd-test";
import { getFirstClusterMember, skipIfNotClustered } from "./helpers/cluster";
import { dismissNotification } from "./helpers/notification";
import { gotoURL } from "./helpers/navigate";

test("cluster member evacuate and restore", async ({ page }, testInfo) => {
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

test("cluster member hardware tab displays the certificate fingerprint", async ({
  page,
}, testInfo) => {
  skipIfNotClustered(testInfo.project.name);

  const member = await getFirstClusterMember(page);
  const response = await page.request.get(`/1.0?target=${member}`);
  const data = (await response.json()) as {
    metadata: { environment: { certificate_fingerprint: string } };
  };
  const fingerprint = data.metadata.environment.certificate_fingerprint;

  await gotoURL(page, `/ui/cluster/member/${member}/hardware`);

  const row = page
    .getByRole("row")
    .filter({ hasText: "Certificate fingerprint" });
  await expect(row.getByText(fingerprint, { exact: true })).toBeVisible();
  await expect(
    row.getByRole("button", { name: "Copy to clipboard" }),
  ).toBeVisible();
});
