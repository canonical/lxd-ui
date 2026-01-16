import type { FC } from "react";
import { Tooltip } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ResourceLink from "components/ResourceLink";
import NetworkRichTooltip from "./NetworkRichTooltip";
import { SMALL_TOOLTIP_BREAKPOINT } from "components/RichTooltipTable";

interface Props {
  networkName: string;
  projectName: string;
  clusterMember?: string;
  className?: string;
  disabled?: boolean;
}

const NetworkRichChip: FC<Props> = ({
  networkName,
  projectName,
  clusterMember,
  className,
  disabled,
}) => {
  const showTooltip = !useIsScreenBelow(SMALL_TOOLTIP_BREAKPOINT, "height");

  const networkUrl = clusterMember
    ? `/ui/project/${encodeURIComponent(projectName)}/member/${encodeURIComponent(clusterMember)}/network/${encodeURIComponent(networkName)}`
    : `/ui/project/${encodeURIComponent(projectName)}/network/${encodeURIComponent(networkName)}`;
  const resourceLink = (
    <ResourceLink
      type="network"
      value={networkName}
      to={networkUrl}
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
      message={
        <NetworkRichTooltip
          networkName={networkName}
          projectName={projectName}
          networkUrl={networkUrl}
          clusterMember={clusterMember}
        />
      }
    >
      {resourceLink}
    </Tooltip>
  );
};

export default NetworkRichChip;
