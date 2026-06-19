import { expect, test } from "./fixtures/lxd-test";
import { skipIfNotClustered } from "./helpers/cluster";
import {
  assertReadMode,
  selectionCustomSelectOption,
} from "./helpers/configuration";
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
  deleteReplicator,
  randomReplicatorName,
  runReplicator,
  skipIfNotSupported,
} from "./helpers/replicators";

test.describe("Replicators", () => {
  const replicatorName = randomReplicatorName();
  const projectName = randomProjectName();
  const linkName = randomLinkName();

  test.beforeAll(({ lxdVersion }) => {
    skipIfNotSupported(lxdVersion);
  });

  test.afterAll(async ({ page, lxdVersion }) => {
    if (lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge") {
      return;
    }

    await deleteReplicator(page, replicatorName);
    await deleteProject(page, projectName);
    deleteProjectOnRemoteCluster(projectName);
    deleteClusterLinkOnRemoteCluster(linkName);
    await deleteClusterLink(page, linkName);
  });

  test("Create and run a replicator", async ({ page }, testInfo) => {
    skipIfNotClustered(testInfo.project.name);

    const token = createClusterLinkOnRemoteCluster(linkName);
    await createClusterLink(page, linkName, token);

    await createProject(page, projectName);
    await openProjectConfiguration(page);
    await page.getByText("Replication").click();
    await page.getByRole("button", { name: "Promote to leader" }).click();
    await dismissNotification(
      page,
      `Project ${projectName} promoted to leader.`,
    );

    createStandbyProjectOnRemoteCluster(projectName, linkName);

    await page.getByRole("button", { name: "Clustering" }).click();
    await page.getByRole("link", { name: "Replicators", exact: true }).click();
    await page.getByRole("button", { name: "Create replicator" }).click();
    await page.getByRole("heading", { name: "Create replicator" }).waitFor();

    await page.getByLabel("Name").fill(replicatorName);
    const replicatorDescription = `Playwright E2E test replicator - ID: ${testInfo.testId}`;
    await page.getByLabel("Description").fill(replicatorDescription);
    await selectionCustomSelectOption(page, "* Project", projectName);
    await selectionCustomSelectOption(page, "* Cluster", linkName);

    const createButton = page.getByRole("button", {
      name: "Create",
      exact: true,
    });
    await expect(createButton).toBeEnabled();
    await createButton.click();
    await dismissNotification(page, `Replicator ${replicatorName} created.`);

    const rowKey = `${replicatorName} ${projectName}`;
    const replicatorRow = page.getByRole("row").filter({ hasText: rowKey });
    await replicatorRow
      .getByRole("rowheader")
      .getByRole("link", { name: replicatorName })
      .click();

    await page.getByRole("heading", { name: replicatorName }).waitFor();
    await assertReadMode(page, "Description", replicatorDescription);

    await runReplicator(page, replicatorName);
  });
});
