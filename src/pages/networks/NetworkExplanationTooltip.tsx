import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const NetworkExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Configure and manage virtual and physical networks to connect instances."
        docPath="/explanation/networks/"
      />
    </span>
  );
};

export default NetworkExplanationTooltip;
