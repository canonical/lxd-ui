import type { FC } from "react";
import { Spinner } from "@canonical/react-components";
import StatusIcon from "components/StatusIcon";
import { useClusterLinkState } from "context/useClusterLinks";
import { useIdentities } from "context/useIdentities";
import type { LxdClusterLink, StatusCaption } from "types/cluster";
import { getClusterLinksStatus, getLinkIdentity } from "util/clusterLink";
import type { StatusTone } from "util/statusColors";

interface Props {
  link: LxdClusterLink;
}

const STATUS_ICONS: Record<StatusCaption, StatusTone> = {
  Reachable: "positive",
  Unreachable: "negative",
  Pending: "neutral",
};

const ClusterLinkStatus: FC<Props> = ({ link }) => {
  const { data: state, isLoading } = useClusterLinkState(link.name);
  const { data: identities = [] } = useIdentities();

  if (isLoading) {
    return <Spinner className="status-spinner" />;
  }

  const identity = getLinkIdentity(identities, link.name);
  const status = getClusterLinksStatus(identity, state, link);

  return (
    <>
      <StatusIcon tone={STATUS_ICONS[status]} className="status-icon" />
      {status}
    </>
  );
};

export default ClusterLinkStatus;
