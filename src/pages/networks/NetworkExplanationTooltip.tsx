import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const NetworkExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Configure and manage virtual and physical networks to connect instances."
      docPath="/explanation/networks/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default NetworkExplanationTooltip;
