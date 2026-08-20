import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const LocalPeeringExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="Local peering connects two networks on the same LXD cluster."
      docPath="/howto/network_peers/"
      docLabel="Learn more about network peers"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default LocalPeeringExplanationTooltip;
