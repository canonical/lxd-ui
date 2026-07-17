import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const LocalPeeringExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Route traffic directly between two networks on the same server without external gateways."
      docPath="/howto/network_peers/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default LocalPeeringExplanationTooltip;
