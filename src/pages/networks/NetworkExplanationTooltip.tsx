import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const NetworkExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--inline"
      explanation="Networks can be virtual or physical, and connect instances."
      docPath="/explanation/networks/"
      docLabel="Learn more about networks"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default NetworkExplanationTooltip;
