import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ProjectExplanationTooltip: FC<{
  children?: ReactNode;
  isConfigVariant?: boolean;
}> = ({ children, isConfigVariant }) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--breadcrumb"
      explanation={
        isConfigVariant
          ? "View and manage project-level configuration settings and resources."
          : "Projects organise and isolate entities and tenants into separate groups."
      }
      docPath="/reference/projects/"
      docLabel="Learn more about projects"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ProjectExplanationTooltip;
