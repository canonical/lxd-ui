import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const InstanceExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Manage and monitor virtual machines and containers."
      docPath="/explanation/instances/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default InstanceExplanationTooltip;
