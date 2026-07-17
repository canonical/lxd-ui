import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const WarningExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Review system warnings and issues that may require attention."
      docPath="/howto/troubleshoot/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default WarningExplanationTooltip;
