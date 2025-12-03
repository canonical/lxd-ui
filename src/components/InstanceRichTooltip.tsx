import type { FC } from "react";
import { Tooltip } from "@canonical/react-components";
import { InstanceRichTooltipMessage } from "./InstanceRichTooltipMessage";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ResourceLink from "./ResourceLink";

interface Props {
  instanceName: string;
  projectName: string;
}

export const InstanceRichTooltip: FC<Props> = ({
  instanceName,
  projectName,
}) => {
  const isSmallScreen = useIsScreenBelow();
  const instanceUrl = `/ui/project/${encodeURIComponent(projectName)}/instance/${encodeURIComponent(instanceName)}`;
  const resourceLink = (
    <ResourceLink
      type="instance"
      value={instanceName}
      to={instanceUrl}
      hasTitle={isSmallScreen}
    />
  );

  if (isSmallScreen) {
    return <>{resourceLink}</>;
  }

  return (
    <Tooltip
      message={
        <InstanceRichTooltipMessage
          instanceName={instanceName}
          projectName={projectName}
        />
      }
    >
      {resourceLink}
    </Tooltip>
  );
};
