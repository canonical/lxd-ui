import type { LxdClusterLinkState, StatusCaption } from "types/cluster";
import type { LxdIdentity } from "types/permissions";

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
