import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ProjectExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--breadcrumb"
      explanation="Projects organise and isolate LXD resources into separate groups."
      docPath="/reference/projects/"
      docLabel="Learn more about projects"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ProjectExplanationTooltip;
