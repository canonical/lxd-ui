import { test, expect } from "./fixtures/lxd-test";
import { skipIfNotClustered } from "./helpers/cluster";
import { skipIfNotSupported } from "./helpers/cluster-groups";
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
} from "./helpers/projects";
import { dismissNotification } from "./helpers/notification";
import {
  createClusterLink,
  createClusterLinkOnRemoteCluster,
  deleteClusterLink,
  deleteClusterLinkOnRemoteCluster,
  randomLinkName,
} from "./helpers/cluster-links";

let project: string;

test.beforeEach(async ({ page, lxdVersion }, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  project = randomProjectName();
  await createProject(page, project);
  await openProjectConfiguration(page);
});

test("project edit configuration", async ({ page }) => {
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

test("project replication configuration with cluster link", async ({
  page,
}) => {
  // Create a reachable cluster link
  const linkName = randomLinkName();
  const token = createClusterLinkOnRemoteCluster(linkName);
  await createClusterLink(page, linkName, token);

  await openProjectConfiguration(page);
  await page.getByText("Replication").click();

  const replicaModeText = await page
    .getByRole("group", { name: "Replica mode" })
    .textContent();
  expect(replicaModeText).toContain("None");
  await page.getByText("No replication configuration applied.").waitFor();
  await page.getByText("Outgoing replicators will be managed here.").waitFor();

  await setOption(page, "Replica cluster", linkName);

  await page.getByRole("button", { name: "Save 1 change" }).click();
  await dismissNotification(page, `Project ${project} updated.`);

  const replicaClusterText = await page
    .getByRole("button", { name: "Replica cluster" })
    .textContent();
  expect(replicaClusterText).toContain(linkName);

  // Demote project to standby
  await page.getByRole("button", { name: "Demote to standby" }).click();
  await dismissNotification(page, `Project ${project} demoted to standby.`);

  const demotedModeText = await page
    .getByRole("group", { name: "Replica mode" })
    .textContent();
  expect(demotedModeText).toContain("standby");
  await page
    .getByText("This project is a read-only failover target.")
    .waitFor();
  await page
    .getByText("Cluster this project will receive data from.")
    .waitFor();

  await deleteProject(page, project);
  deleteClusterLinkOnRemoteCluster(linkName);
  await deleteClusterLink(page, linkName);
});

test("project replication configuration promote to leader", async ({
  page,
}) => {
  await page.getByText("Replication").click();

  const replicaModeText = await page
    .getByRole("group", { name: "Replica mode" })
    .textContent();
  expect(replicaModeText).toContain("None");

  // Promote project to leader
  await page.getByRole("button", { name: "Promote to leader" }).click();
  await dismissNotification(page, `Project ${project} promoted to leader.`);

  const promotedModeText = await page
    .getByRole("group", { name: "Replica mode" })
    .textContent();
  expect(promotedModeText).toContain("leader");

  await page
    .getByText("This project is the active source project for replication.")
    .waitFor();
  await page.getByText("Cluster to replicate this project to.").waitFor();

  await deleteProject(page, project);
});
