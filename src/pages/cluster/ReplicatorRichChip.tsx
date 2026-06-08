import type { FC } from "react";
import { Tooltip } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ResourceLink from "components/ResourceLink";
import { SMALL_TOOLTIP_BREAKPOINT } from "components/RichTooltipTable";
import { ROOT_PATH } from "util/rootPath";
import ReplicatorRichTooltip from "./ReplicatorRichTooltip";

interface Props {
  replicator: string;
  project: string;
  className?: string;
  disabled?: boolean;
}

const ReplicatorRichChip: FC<Props> = ({
  replicator,
  project,
  className,
  disabled,
}) => {
  const showTooltip = !useIsScreenBelow(SMALL_TOOLTIP_BREAKPOINT, "height");

  const url = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/replicator/${encodeURIComponent(replicator)}`;
  const resourceLink = (
    <ResourceLink
      type="replicator"
      value={replicator}
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
      message={
        <ReplicatorRichTooltip replicatorName={replicator} project={project} />
      }
    >
      {resourceLink}
    </Tooltip>
  );
};

export default ReplicatorRichChip;
