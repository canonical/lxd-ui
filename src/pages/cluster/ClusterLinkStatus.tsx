import type { FC } from "react";
import { Icon, Spinner } from "@canonical/react-components";
import type { LxdClusterLink, StatusCaption } from "types/cluster";
import { useClusterLinkState } from "context/useClusterLinks";
import { useIdentities } from "context/useIdentities";
import { getClusterLinksStatus, getLinkIdentity } from "util/clusterLinkStatus";

interface Props {
  link: LxdClusterLink;
}

const STATUS_ICONS: Record<StatusCaption, string> = {
  Reachable: "status-succeeded-small",
  Unreachable: "status-failed-small",
  Pending: "status-queued-small",
};

const ClusterLinkStatus: FC<Props> = ({ link }) => {
  const { data: state, isLoading } = useClusterLinkState(link.name);
  const { data: identities = [] } = useIdentities();

  if (isLoading) {
    return <Spinner className="status-spinner" />;
  }

  const identity = getLinkIdentity(identities, link.name);
  const status = getClusterLinksStatus(identity, state);

  return (
    <>
      <Icon name={STATUS_ICONS[status]} className="status-icon" />
      {status}
    </>
  );
};

export default ClusterLinkStatus;
