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
  skipIfNotSupported as skipIfReplicatorsNotSupported,
  randomReplicatorName,
  createReplicator,
  editReplicatorSidePanel,
  deleteReplicatorRow,
  assertReplicationConfigInitialState,
  setClusterForProject,
  testLeaderPreflightChecks,
  testStandbyPreflightChecks,
  createStandbyProjectOnRemoteCluster,
  deleteProjectOnRemoteCluster,
  deleteAllReplicators,
  deleteAllClusterLinks,
} from "./helpers/replicators";
import {
  randomLinkName,
  deleteClusterLink,
  visitClusterLinks,
  createClusterLinkOnRemoteCluster,
  deleteClusterLinkOnRemoteCluster,
  createClusterLink,
} from "./helpers/cluster-links";
import { createInstance, randomInstanceName } from "./helpers/instances";

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

  // Clean up any leftover replicators and cluster links from failed runs before running the test
  deleteAllReplicators();
  deleteAllClusterLinks();

  // Project & replication config setup
  await createProject(page, project);
  await createInstance(page, instance, "container", project);
  await openProjectConfiguration(page);
  await page.getByText("Replication").click();
  await assertProjectReplicaMode(page, "None");
  await assertReplicationConfigInitialState(page);

  // Cluster link & replica cluster setup
  const clusterLink = randomLinkName();
  const token = createClusterLinkOnRemoteCluster(clusterLink);
  await createClusterLink(page, clusterLink, token);
  await setClusterForProject(page, clusterLink, project);

  // Create standby project & promote to leader
  createStandbyProjectOnRemoteCluster(project, clusterLink);
  await promoteProjectToLeader(page, project);

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

  deleteProjectOnRemoteCluster(project);
  deleteClusterLinkOnRemoteCluster(clusterLink);
  await visitClusterLinks(page);
  await deleteClusterLink(page, clusterLink);
  await deleteProject(page, project);
});
