import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const WarningExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Review system warnings and issues that may require attention."
        docPath="/howto/troubleshoot/"
      />
    </span>
  );
};

export default WarningExplanationTooltip;
