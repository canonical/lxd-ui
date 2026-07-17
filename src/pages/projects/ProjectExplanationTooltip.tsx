import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ProjectExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Organise and isolate entities and tenants into separate groups."
      docPath="/projects/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ProjectExplanationTooltip;
