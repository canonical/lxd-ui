import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const NetworkIPAMExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="View IP address allocation across LXD networks."
      docPath="/howto/network_ipam/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default NetworkIPAMExplanationTooltip;
