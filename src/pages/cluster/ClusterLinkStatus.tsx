import type { FC } from "react";
import { Icon, Spinner } from "@canonical/react-components";
import type { LxdIdentity } from "types/permissions";
import type { LxdClusterLink, StatusCaption } from "types/cluster";
import { useClusterLinkState } from "context/useClusterLinks";
import { getClusterLinksStatus } from "util/clusterLinkStatus";

interface Props {
  link: LxdClusterLink;
  identity?: LxdIdentity;
}

const STATUS_ICONS: Record<StatusCaption, string> = {
  Reachable: "status-succeeded-small",
  Unreachable: "status-failed-small",
  Pending: "status-queued-small",
};

const ClusterLinkStatus: FC<Props> = ({ link, identity }) => {
  const { data: state, isLoading } = useClusterLinkState(link.name);
  if (isLoading) {
    return <Spinner className="status-spinner" />;
  }

  const status = getClusterLinksStatus(identity, state);

  return (
    <>
      <Icon name={STATUS_ICONS[status]} className="status-icon" />
      {status}
    </>
  );
};

export default ClusterLinkStatus;
