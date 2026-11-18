import type { FC } from "react";
import { Tooltip } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ResourceLink from "components/ResourceLink";
import { InstanceRichTooltip } from "pages/instances/InstanceRichTooltip";
import { SMALL_TOOLTIP_BREAKPOINT } from "components/RichTooltipTable";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  instanceName: string;
  projectName: string;
}

export const InstanceRichChip: FC<Props> = ({ instanceName, projectName }) => {
  const showTooltip = !useIsScreenBelow(SMALL_TOOLTIP_BREAKPOINT, "height");

  const instanceUrl = `${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/instance/${encodeURIComponent(instanceName)}`;
  const resourceLink = (
    <ResourceLink
      type="instance"
      value={instanceName}
      to={instanceUrl}
      hasTitle={!showTooltip}
    />
  );

  if (!showTooltip) {
    return <>{resourceLink}</>;
  }

  // Actions mount this element in notifications, so creating it here does not recurse.
  const notificationChip = (
    <InstanceRichChip instanceName={instanceName} projectName={projectName} />
  );

  return (
    <Tooltip
      zIndex={1000}
      position="right"
      message={
        <InstanceRichTooltip
          instanceName={instanceName}
          projectName={projectName}
          instanceLink={notificationChip}
        />
      }
    >
      {resourceLink}
    </Tooltip>
  );
};
