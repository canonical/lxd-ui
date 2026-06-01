import type { FC } from "react";
import { Tooltip } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ResourceLink from "components/ResourceLink";
import { SMALL_TOOLTIP_BREAKPOINT } from "components/RichTooltipTable";
import ClusterLinkRichTooltip from "./ClusterLinkRichTooltip";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  clusterLink: string;
  className?: string;
  disabled?: boolean;
}

const ClusterLinkRichChip: FC<Props> = ({
  clusterLink,
  className,
  disabled,
}) => {
  const showTooltip = !useIsScreenBelow(SMALL_TOOLTIP_BREAKPOINT, "height");

  const url = `${ROOT_PATH}/ui/cluster/links`;
  const resourceLink = (
    <ResourceLink
      type="cluster-link"
      value={clusterLink}
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
      position="right"
      message={<ClusterLinkRichTooltip clusterLink={clusterLink} />}
    >
      {resourceLink}
    </Tooltip>
  );
};

export default ClusterLinkRichChip;
