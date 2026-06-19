import { test, expect } from "./fixtures/lxd-test";
import { skipIfNotClustered } from "./helpers/cluster";
import { skipIfNotSupported } from "./helpers/cluster-groups";
import { setOption } from "./helpers/configuration";
import { dismissNotification } from "./helpers/notification";
import {
  createProject,
  deleteProject,
  openProjectConfiguration,
  randomProjectName,
} from "./helpers/projects";
import {
  createClusterLink,
  createClusterLinkOnRemoteCluster,
  deleteClusterLink,
  deleteClusterLinkOnRemoteCluster,
  randomLinkName,
} from "./helpers/cluster-links";
import {
  createStandbyProjectOnRemoteCluster,
  deleteProjectOnRemoteCluster,
  randomReplicatorName,
} from "./helpers/replicators";

test("end-to-end replicator lifecycle execution", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const linkName = randomLinkName();
  const token = createClusterLinkOnRemoteCluster(linkName);
  await createClusterLink(page, linkName, token);

  const projectName = randomProjectName();
  await createProject(page, projectName);
  await openProjectConfiguration(page);
  await page.getByText("Replication").click();
  await page.getByRole("button", { name: "Promote to leader" }).click();
  await dismissNotification(page, `Project ${projectName} promoted to leader.`);

  createStandbyProjectOnRemoteCluster(projectName, linkName);

  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Replicators" }).click();

  const replicatorName = randomReplicatorName();
  await page.getByRole("button", { name: "Create replicator" }).click();
  await page.getByRole("heading", { name: "Create replicator" }).waitFor();

  await page.getByLabel("Name").fill(replicatorName);
  await page
    .getByLabel("Description")
    .fill(`Playwright E2E test replicator - ID: ${testInfo.testId}`);
  await setOption(page, "Project", projectName);
  await setOption(page, "Cluster", linkName);

  await page.getByRole("button", { name: "Create" }).click();
  await dismissNotification(page, `Replicator ${replicatorName} created.`);

  const rowKey = `${replicatorName} ${projectName}`;
  const replicatorRow = page.getByRole("row").filter({ hasText: rowKey });
  await expect(replicatorRow).toBeVisible();

  await deleteProject(page, projectName);
  deleteProjectOnRemoteCluster(projectName);
  deleteClusterLinkOnRemoteCluster(linkName);
  await deleteClusterLink(page, linkName);
});
