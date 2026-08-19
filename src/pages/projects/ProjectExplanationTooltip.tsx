import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ProjectExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Projects organise and isolate entities and tenants into separate groups within your deployment."
      docPath="/projects/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ProjectExplanationTooltip;
