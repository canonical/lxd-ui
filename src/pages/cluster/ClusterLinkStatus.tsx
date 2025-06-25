import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import type { LxdIdentity } from "types/permissions";
import type { LxdClusterLink } from "types/cluster";
import { useClusterLinkState } from "context/useClusterLinks";

interface Props {
  link: LxdClusterLink;
  identity?: LxdIdentity;
}

type StatusCaption = "Pending" | "Reachable" | "Unreachable";

const ClusterLinkStatus: FC<Props> = ({ link, identity }) => {
  const { data: state, isLoading } = useClusterLinkState(link.name);

  const getIconNameForStatus = (status: StatusCaption) => {
    return (
      {
        Reachable: "status-succeeded-small",
        Unreachable: "status-failed-small",
        Pending: "status-queued-small",
      }[status] ?? ""
    );
  };

  const getStatus = (): StatusCaption => {
    if (identity?.type.includes("(pending)")) {
      return "Pending";
    }
    if (
      state?.cluster_link_members.some((member) => member.status === "Active")
    ) {
      return "Reachable";
    }
    return "Unreachable";
  };

  if (isLoading) {
    return null;
  }

  const status = getStatus();

  return (
    <>
      <Icon name={getIconNameForStatus(status)} className="status-icon" />
      {status}
    </>
  );
};

export default ClusterLinkStatus;
