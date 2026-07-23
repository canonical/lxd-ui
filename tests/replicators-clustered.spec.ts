import { expect, test } from "./fixtures/lxd-test";
import { getRemoteClusterVm, skipIfNotClustered } from "./helpers/cluster";
import { randomLinkName } from "./helpers/cluster-links";
import { randomInstanceName } from "./helpers/instances";
import { randomProjectName } from "./helpers/projects";
import {
  createReplicator,
  deleteAllAfterReplicatorTest,
  deleteReplicatorFromDetailPage,
  editReplicatorSidePanel,
  randomReplicatorName,
  runReplicatorFromDetailPage,
  setupProjectsForReplicator,
  skipIfReplicatorsNotSupported,
} from "./helpers/replicators";
import { runCommand } from "./helpers/shell";

test("Replicator", async ({ page, lxdVersion }, testInfo) => {
  skipIfReplicatorsNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const project = randomProjectName();
  const instance = randomInstanceName();
  const clusterLink = randomLinkName();

  await setupProjectsForReplicator(page, project, instance, clusterLink);

  const replicator = randomReplicatorName();
  await createReplicator(page, replicator, clusterLink, project);

  const replicatorRow = page.getByRole("row").filter({ hasText: replicator });
  await replicatorRow.getByRole("link", { name: replicator }).click();
  await expect(page.getByRole("heading", { name: "General" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Target" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sync" })).toBeVisible();
  await expect(page.getByRole("cell", { name: project })).toBeVisible();
  await expect(page.getByRole("cell", { name: clusterLink })).toBeVisible();

  // Edit replicator from detail page before running it.
  const updatedDescription = "Replication schedule updated by Replicator test";
  const updatedSchedule = "30 2 * * *";
  await page.getByRole("button", { name: "Edit" }).click();
  await editReplicatorSidePanel(
    page,
    replicator,
    updatedDescription,
    updatedSchedule,
  );
  await expect(
    page.getByRole("cell", { name: updatedDescription }),
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: updatedSchedule })).toBeVisible();

  await runReplicatorFromDetailPage(
    page,
    replicator,
    "Run",
    project,
    clusterLink,
  );

  // Verify instance was copied to the standby remote cluster.
  const remoteVm = getRemoteClusterVm();
  const replicatedInstance = runCommand(
    `lxc exec ${remoteVm} -- sh -c 'lxc list --project=${project} --format csv -c n | grep -x ${instance}'`,
  );
  expect(replicatedInstance.trim()).toBe(instance);

  await deleteReplicatorFromDetailPage(page, replicator);

  // We should be back on the replicators list after detail-page deletion.
  await expect(replicatorRow).toHaveCount(0);
  await deleteAllAfterReplicatorTest(page, project, clusterLink, instance);
});
