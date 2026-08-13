import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ServerExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Monitor server information, status, and resource usage."
      docPath="/explanation/clustering/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ServerExplanationTooltip;
