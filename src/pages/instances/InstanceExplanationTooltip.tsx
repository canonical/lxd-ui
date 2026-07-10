import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const InstanceExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Manage and monitor virtual machines and containers running on the LXD server."
        docPath="/explanation/instances/"
      />
    </span>
  );
};

export default InstanceExplanationTooltip;
