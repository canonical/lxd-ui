import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ServerExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Monitor server information, status, and resource usage."
        docPath="/explanation/clustering/"
      />
    </span>
  );
};

export default ServerExplanationTooltip;
