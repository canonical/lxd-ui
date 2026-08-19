import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const LocalPeeringExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Route traffic directly between two networks on the same cluster without external gateways."
      docPath="/howto/network_peers/"
      docLabel="Learn more about network peers"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default LocalPeeringExplanationTooltip;
