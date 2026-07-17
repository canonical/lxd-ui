import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const OperationExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Track background tasks performed by LXD."
        docPath="/rest-api/#/operations"
      />
    </span>
  );
};

export default OperationExplanationTooltip;
