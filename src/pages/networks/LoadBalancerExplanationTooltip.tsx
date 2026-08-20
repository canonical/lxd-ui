import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const LoadBalancerExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="Load balancers distribute services running on instances across networks."
      docPath="/howto/network_load_balancers/"
      docLabel="Learn more about load balancers"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default LoadBalancerExplanationTooltip;
