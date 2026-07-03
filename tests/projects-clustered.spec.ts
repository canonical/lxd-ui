import { test, expect } from "./fixtures/lxd-test";
import { skipIfClusteringNotSupported } from "./helpers/cluster-groups";
import {
  assertReadMode,
  setMultiselectOption,
  setOption,
} from "./helpers/configuration";
import { assertTextVisible } from "./helpers/permissions";
import {
  createProject,
  deleteProject,
  openProjectConfiguration,
  randomProjectName,
  promoteProjectToLeader,
  demoteProjectToStandby,
  assertProjectReplicaMode,
} from "./helpers/projects";
import { skipIfNotClustered } from "./helpers/cluster";
import { dismissNotification } from "./helpers/notification";
import {
  skipIfReplicatorsNotSupported,
  randomReplicatorName,
  createReplicator,
  editReplicatorSidePanel,
  deleteReplicatorRow,
  testLeaderPreflightChecks,
  testStandbyPreflightChecks,
  setupProjectsForReplicator,
  deleteAllAfterReplicatorTest,
} from "./helpers/replicators";
import { randomLinkName } from "./helpers/cluster-links";
import { randomInstanceName } from "./helpers/instances";

test("project edit configuration", async ({ page, lxdVersion }, testInfo) => {
  skipIfClusteringNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const project = randomProjectName();
  await createProject(page, project);
  await openProjectConfiguration(page);

  await page.getByPlaceholder("Enter description").fill("A-new-description");
  await page.getByText("Allow custom restrictions on a project level").click();

  await page.getByText("Clusters").click();
  await setMultiselectOption(page, "Cluster groups", "default");
  await setOption(page, "Direct cluster targeting", "allow");

  await page.getByRole("button", { name: "Save 4 changes" }).click();
  await dismissNotification(page, `Project ${project} updated.`);

  await page.getByText("Project details").click();

  await assertTextVisible(page, "DescriptionA-new-description");

  await page.getByText("Clusters").click();
  await assertReadMode(page, "Cluster groups targeting", "default");
  await assertReadMode(page, "Direct cluster targeting", "Allow");
  await deleteProject(page, project);
});

// Project replication
test("project replication configuration", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfReplicatorsNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const project = randomProjectName();
  const instance = randomInstanceName();
  const clusterLink = randomLinkName();

  await setupProjectsForReplicator(page, project, instance, clusterLink);

  // Create & edit replicator
  const replicator = randomReplicatorName();
  await createReplicator(page, replicator, clusterLink, project);
  const replicatorRow = page.getByRole("row").filter({ hasText: replicator });

  await replicatorRow.getByRole("button", { name: "Edit replicator" }).click();
  await editReplicatorSidePanel(page, replicator, "Updated description");

  await testLeaderPreflightChecks(page, replicator, project, clusterLink);

  await demoteProjectToStandby(page, project);
  await testStandbyPreflightChecks(page, replicator, project, clusterLink);

  // Promote back to leader from standby
  await promoteProjectToLeader(page, project);

  // Delete replicator & clear replica mode
  await deleteReplicatorRow(page, replicator);
  await expect(replicatorRow).toHaveCount(0);

  await page.getByRole("button", { name: "Clear replica mode" }).click();
  await assertProjectReplicaMode(page, "None");

  await deleteAllAfterReplicatorTest(page, project, clusterLink);
});
