import type { FC } from "react";
import { Tooltip } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ResourceLink from "components/ResourceLink";
import { SMALL_TOOLTIP_BREAKPOINT } from "components/RichTooltipTable";
import ClusterMemberRichTooltip from "./ClusterMemberRichTooltip";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  clusterMember: string;
  className?: string;
  disabled?: boolean;
}

const ClusterMemberRichChip: FC<Props> = ({
  clusterMember,
  className,
  disabled,
}) => {
  const showTooltip = !useIsScreenBelow(SMALL_TOOLTIP_BREAKPOINT, "height");

  const url = `${ROOT_PATH}/ui/cluster/member/${encodeURIComponent(clusterMember)}`;
  const resourceLink = (
    <ResourceLink
      type="cluster-member"
      value={clusterMember}
      to={url}
      hasTitle={!showTooltip}
      className={className}
      disabled={disabled}
    />
  );

  if (!showTooltip) {
    return <>{resourceLink}</>;
  }

  return (
    <Tooltip
      zIndex={1000}
      message={<ClusterMemberRichTooltip clusterMember={clusterMember} />}
    >
      {resourceLink}
    </Tooltip>
  );
};

export default ClusterMemberRichChip;
