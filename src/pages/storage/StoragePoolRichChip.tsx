import type { FC } from "react";
import { Tooltip } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ResourceLink from "components/ResourceLink";
import { SMALL_TOOLTIP_BREAKPOINT } from "components/RichTooltipTable";
import StoragePoolRichTooltip from "./StoragePoolRichTooltip";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  poolName: string;
  projectName: string;
  className?: string;
  disabled?: boolean;
  location?: string;
}

const StoragePoolRichChip: FC<Props> = ({
  poolName,
  projectName,
  className,
  disabled,
  location,
}) => {
  const showTooltip = !useIsScreenBelow(SMALL_TOOLTIP_BREAKPOINT, "height");

  const url = `${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/storage/pool/${encodeURIComponent(poolName)}`;

  const resourceLink = (
    <ResourceLink
      type="pool"
      value={poolName}
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
      message={
        <StoragePoolRichTooltip
          poolName={poolName}
          url={url}
          location={location}
        />
      }
    >
      {resourceLink}
    </Tooltip>
  );
};

export default StoragePoolRichChip;
