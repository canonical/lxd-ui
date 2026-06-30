import type { Page } from "@playwright/test";
import { getRemoteClusterVm } from "./cluster-links";
import { randomNameSuffix } from "./name";
import { dismissNotification } from "./notification";
import { runCommand } from "./shell";
import { test, type LxdVersions } from "../fixtures/lxd-test";

export const skipIfNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge",
    "Replicators tests not supported for lxd 5.0 and 5.21",
  );
};

export const randomReplicatorName = (): string => {
  return `playwright-replicator-${randomNameSuffix()}`;
};

export const createStandbyProjectOnRemoteCluster = (
  project: string,
  link: string,
) => {
  const targetVM = getRemoteClusterVm();
  runCommand(
    `lxc exec ${targetVM} -- sh -c 'lxc project create ${project} -c replica.cluster=${link}'`,
  );

  runCommand(
    `lxc exec ${targetVM} -- sh -c 'lxc project demote-replica ${project}'`,
  );
};

export const deleteProjectOnRemoteCluster = (project: string) => {
  const targetVM = getRemoteClusterVm();
  runCommand(`lxc exec ${targetVM} -- sh -c 'lxc project delete ${project}'`);
};

export const runReplicator = async (page: Page, replicatorName: string) => {
  await page.getByRole("button", { name: "Run" }).click();
  const confirmationModal = page.locator(".run-replicator-modal");
  await confirmationModal.waitFor();

  const confirmRunBtn = confirmationModal.getByRole("button", {
    name: "Run",
    exact: true,
  });
  await confirmRunBtn.click();

  await dismissNotification(page, `Replicator ${replicatorName} started.`);
  await dismissNotification(
    page,
    `Replicator ${replicatorName} completed successfully.`,
  );
};

export const deleteReplicator = async (page: Page, replicatorName: string) => {
  await page.getByRole("button", { name: "Delete" }).click();

  const dialog = page.getByRole("dialog", { name: "Confirm delete" });
  if ((await dialog.count()) > 0) {
    await dialog.getByRole("button", { name: "Delete" }).click();
  }
  await dismissNotification(page, `Replicator ${replicatorName} deleted.`);
};
