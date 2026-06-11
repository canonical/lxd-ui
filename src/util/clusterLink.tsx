import { fetchClusterLinkState } from "api/cluster-links";
import type { LxdClusterLinkState, StatusCaption } from "types/cluster";
import type { LxdIdentity } from "types/permissions";
import type { LxdProject } from "types/project";
import type { TestContext } from "yup";
import { ROOT_PATH } from "./rootPath";

export const getClusterLinksStatus = (
  identity?: LxdIdentity,
  state?: LxdClusterLinkState,
): StatusCaption => {
  if (identity?.type.toLowerCase().includes("(pending)")) {
    return "Pending";
  }
  if (
    state?.cluster_link_members.some((member) => member.status === "Active")
  ) {
    return "Reachable";
  }
  return "Unreachable";
};

export const getLinkIdentity = (
  identities: LxdIdentity[],
  linkName: string | undefined | null,
) => {
  if (!linkName) return undefined;

  return identities.find(
    (identity) =>
      identity.name === linkName &&
      identity.type.startsWith("Cluster link certificate"),
  );
};

const isClusterLinkReachable = async (cluster: string): Promise<boolean> => {
  const state = await fetchClusterLinkState(cluster);
  const status = getClusterLinksStatus(undefined, state);
  return status === "Reachable";
};

const NOT_REACHABLE_ERROR_MESSAGE =
  "The cluster must be Reachable. Make sure a matching link has been created on the target cluster using the generated token.";

export const testReachableClusterLink = async (
  value: string | undefined,
  context: TestContext,
) => {
  if (!value) {
    return true;
  }

  try {
    const isReachable = await isClusterLinkReachable(value);
    if (isReachable) {
      return true;
    }

    return context.createError({ message: NOT_REACHABLE_ERROR_MESSAGE });
  } catch {
    return context.createError({ message: NOT_REACHABLE_ERROR_MESSAGE });
  }
};

export const testProjectReplicaCluster = (
  project?: LxdProject,
  selectedCluster?: string,
): boolean => {
  if (!project) {
    return true;
  }

  const replicaCluster = project.config["replica.cluster"];

  if (!replicaCluster || !selectedCluster) {
    return true;
  }

  return replicaCluster === selectedCluster;
};

export const getClusterLinkListUrl = (isClustered = false): string => {
  return isClustered
    ? `${ROOT_PATH}/ui/cluster/links`
    : `${ROOT_PATH}/ui/server/cluster-links`;
};
