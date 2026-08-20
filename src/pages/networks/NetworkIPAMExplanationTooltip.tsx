import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const NetworkIPAMExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="IPAM tracks IP address allocation across LXD networks."
      docPath="/howto/network_ipam/"
      docLabel="Learn more about network IPAM"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default NetworkIPAMExplanationTooltip;
