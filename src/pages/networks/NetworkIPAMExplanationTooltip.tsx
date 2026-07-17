import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const NetworkIPAMExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="View IP address allocation and tracking across LXD networks."
        docPath="/howto/network_ipam/"
      />
    </span>
  );
};

export default NetworkIPAMExplanationTooltip;
