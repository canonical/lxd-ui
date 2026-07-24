import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ProjectConfigurationExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <span className="explanation-tooltip-wrapper explanation-tooltip-wrapper--breadcrumb">
      {children}
      <ExplanationTooltip
        explanation="View and manage project-level configuration settings and resources."
        docPath="/reference/projects/"
      />
    </span>
  );
};

export default ProjectConfigurationExplanationTooltip;
