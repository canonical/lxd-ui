import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const LocalPeeringExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="Local peering connects two OVN networks on the same LXD cluster."
      docPath="/howto/network_ovn_peers/"
      docLabel="Learn more about local peering"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default LocalPeeringExplanationTooltip;
