import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ProjectConfigurationExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--breadcrumb"
      explanation="View and manage project-level configuration settings and resources."
      docPath="/reference/projects/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ProjectConfigurationExplanationTooltip;
