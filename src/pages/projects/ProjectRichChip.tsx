import type { FC } from "react";
import { Tooltip } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ResourceLink from "components/ResourceLink";
import { SMALL_TOOLTIP_BREAKPOINT } from "components/RichTooltipTable";
import ProjectRichTooltip from "pages/projects/ProjectRichTooltip";

interface Props {
  projectName: string;
  toSuffix?: string;
  className?: string;
  disabled?: boolean;
}

const ProjectRichChip: FC<Props> = ({
  projectName,
  toSuffix,
  className,
  disabled,
}) => {
  const showTooltip = !useIsScreenBelow(SMALL_TOOLTIP_BREAKPOINT, "height");

  const projectUrl = toSuffix
    ? `/ui/project/${encodeURIComponent(projectName)}${toSuffix}`
    : `/ui/project/${encodeURIComponent(projectName)}`;

  const resourceLink = (
    <ResourceLink
      type="project"
      value={projectName}
      to={projectUrl}
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
      message={<ProjectRichTooltip projectName={projectName} />}
    >
      {resourceLink}
    </Tooltip>
  );
};

export default ProjectRichChip;
