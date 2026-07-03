import { type LxdVersions, test, expect } from "../fixtures/lxd-test";
import type { Page } from "@playwright/test";
import { dismissNotification } from "./notification";
import { randomNameSuffix } from "./name";
import { runCommand } from "./shell";
import { DELETE_ALL_CLUSTER_LINKS_COMMAND } from "./cluster-links";
import { getRemoteClusterVm, getLocalClusterVm } from "./cluster";
import { selectReplicaCluster, saveProjectConfiguration } from "./projects";

export const skipIfNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge",
    "Replicators not supported for lxd 5.0 and 5.21",
  );
};

export const randomReplicatorName = (): string => {
  return `playwright-replicator-${randomNameSuffix()}`;
};

const DELETE_ALL_REPLICATORS_COMMAND =
  "for p in $(lxc project list --format csv | cut -d, -f1); do " +
  "lxc replicator list --project=$p --format csv | cut -d, -f1 | " +
  "xargs -r -n1 lxc replicator delete --project=$p; " +
  "done";

export const createReplicator = async (
  page: Page,
  replicatorName: string,
  clusterLink: string,
  projectName: string,
) => {
  await page.getByRole("button", { name: "Create replicator" }).click();
  const sidePanel = page.getByLabel("Side panel");
  await sidePanel.getByLabel("Cluster").click();
  await page.getByRole("option").filter({ hasText: clusterLink }).click();
  await sidePanel.getByLabel("Name").fill(replicatorName);
  await sidePanel.getByRole("button", { name: "Project" }).click();
  await page.getByRole("option").filter({ hasText: projectName }).click();

  await sidePanel.getByRole("button", { name: "Create" }).click();
  await dismissNotification(page, `Replicator ${replicatorName} created.`);
};

export const editReplicatorSidePanel = async (
  page: Page,
  replicatorName: string,
  newDescription: string,
  newSchedule?: string,
) => {
  const sidePanel = page.getByLabel("Side panel");
  await sidePanel.getByPlaceholder("Enter description").fill(newDescription);

  if (newSchedule) {
    await sidePanel.getByLabel("Schedule").fill(newSchedule);
  }

  await sidePanel.getByRole("button", { name: "Update" }).click();
  await dismissNotification(page, `Replicator ${replicatorName} updated.`);
};

export const deleteReplicatorRow = async (
  page: Page,
  replicatorName: string,
) => {
  const row = page.getByRole("row").filter({ hasText: replicatorName });
  const deleteButton = row.getByTitle("Delete");
  await deleteButton.click();

  const dialog = page.getByRole("dialog", { name: "Confirm delete" });
  const confirmButton = dialog
    .getByRole("button")
    .filter({ hasText: "Delete" });
  await confirmButton.click();
  await dismissNotification(page, `Replicator ${replicatorName} deleted.`);
};

export const openReplicatorRunModal = async (
  page: Page,
  replicatorName: string,
  mode: "Run" | "Restore" = "Run",
) => {
  const row = page.getByRole("row").filter({ hasText: replicatorName });
  const runButton = row.getByTitle(mode);
  await runButton.click();
  await expect(
    page.getByRole("dialog", { name: `${mode} replicator` }),
  ).toBeVisible();
};

export const testLeaderPreflightChecks = async (
  page: Page,
  replicatorName: string,
  projectName: string,
  clusterLinkName: string,
) => {
  await openReplicatorRunModal(page, replicatorName);
  const dialog = page.getByRole("dialog", { name: "Run replicator" });
  await expect(
    dialog.getByText(`Project ${projectName} is in leader mode`),
  ).toBeVisible();
  await expect(
    dialog.getByText(`Cluster link ${clusterLinkName} is reachable`),
  ).toBeVisible();
  await expect(
    dialog.getByText(
      `This will sync 1 instance from the source project ${projectName} to the standby cluster ${clusterLinkName}`,
    ),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
};

export const testStandbyPreflightChecks = async (
  page: Page,
  replicatorName: string,
  projectName: string,
  clusterLinkName: string,
) => {
  await openReplicatorRunModal(page, replicatorName, "Restore");
  const dialog = page.getByRole("dialog", { name: "Restore replicator" });
  await expect(
    dialog.getByText(`Project ${projectName} is in standby mode`),
  ).toBeVisible();
  await expect(
    dialog.getByText(
      `Project ${projectName} replica cluster configuration matches replicator cluster`,
    ),
  ).toBeVisible();
  await expect(
    dialog.getByText(`Cluster link ${clusterLinkName} is reachable`),
  ).toBeVisible();
  await expect(
    dialog.getByText(
      `This will sync all instances from the ${clusterLinkName} cluster back to the ${projectName} project`,
    ),
  ).toBeVisible();
  await expect(
    dialog.getByText(
      "All local data will be overwritten by the remote version",
    ),
  ).toBeVisible();

  const restoreButton = dialog.getByRole("button", { name: "Restore" });
  await expect(restoreButton).toBeDisabled();

  const overwriteConfirmation = dialog.getByLabel("Overwrite local data");
  await dialog.getByText("Overwrite local data").click();
  await expect(overwriteConfirmation).toBeChecked();
  await expect(restoreButton).toBeEnabled();

  await dialog.getByRole("button", { name: "Cancel" }).click();
};

export const createStandbyProjectOnRemoteCluster = (
  project: string,
  link: string,
) => {
  const remoteVm = getRemoteClusterVm();
  runCommand(
    `lxc exec ${remoteVm} -- sh -c 'lxc project create ${project} -c replica.cluster=${link}'`,
  );

  runCommand(
    `lxc exec ${remoteVm} -- sh -c 'lxc project demote-replica ${project}'`,
  );
};

export const deleteProjectOnRemoteCluster = (project: string) => {
  const remoteVm = getRemoteClusterVm();
  runCommand(`lxc exec ${remoteVm} -- sh -c 'lxc project delete ${project}'`);
};

export const deleteAllReplicators = (): void => {
  const localVm = getLocalClusterVm();
  const remoteVm = getRemoteClusterVm();

  console.log(
    "Deleting all existing replicators on the current cluster before test",
  );
  runCommand(
    `lxc exec ${localVm} -- sh -c '${DELETE_ALL_REPLICATORS_COMMAND}'`,
  );
  console.log(
    "Deleting all existing replicators on the remote cluster before test",
  );
  runCommand(
    `lxc exec ${remoteVm} -- sh -c '${DELETE_ALL_REPLICATORS_COMMAND}'`,
  );
};

export const deleteAllClusterLinks = (): void => {
  const localVm = getLocalClusterVm();
  const remoteVm = getRemoteClusterVm();

  console.log(
    "Deleting all existing cluster links on the current cluster before test",
  );
  runCommand(
    `lxc exec ${localVm} -- sh -c '${DELETE_ALL_CLUSTER_LINKS_COMMAND}'`,
  );
  console.log(
    "Deleting all existing cluster links on the remote cluster before test",
  );
  runCommand(
    `lxc exec ${remoteVm} -- sh -c '${DELETE_ALL_CLUSTER_LINKS_COMMAND}'`,
  );
};

export const assertReplicationConfigInitialState = async (page: Page) => {
  await expect(
    page.getByRole("heading", { name: "Replicators for this project" }),
  ).toBeVisible();
  await expect(
    page.getByText("Only outgoing replicators are shown here"),
  ).toBeVisible();
  await expect(
    page.getByText("No replication configuration applied."),
  ).toBeVisible();
};

export const setClusterForProject = async (
  page: Page,
  clusterLinkName: string,
  project: string,
) => {
  await selectReplicaCluster(page, clusterLinkName);
  await saveProjectConfiguration(page, project);
  await expect(page.getByLabel("Replica cluster")).toContainText(
    clusterLinkName,
  );
};
