import { getRemoteClusterVm } from "./cluster-links";
import { randomNameSuffix } from "./name";
import { runCommand } from "./shell";

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
