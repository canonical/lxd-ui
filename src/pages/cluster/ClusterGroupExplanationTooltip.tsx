import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ClusterGroupExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--inline"
      explanation="Cluster groups organize cluster members for instance placement."
      docPath="/explanation/clustering/#cluster-groups"
      docLabel="Learn more about cluster groups"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ClusterGroupExplanationTooltip;
