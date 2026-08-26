import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const LoadBalancerPoolExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="Load balancer pools group instances to process incoming traffic distributed by load balancers."
      docPath="/howto/network_load_balancers/#configure-pools"
      docLabel="Learn more about load balancer pools"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default LoadBalancerPoolExplanationTooltip;
