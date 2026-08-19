import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ClusterGroupExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Cluster groups assist with instance placement."
      docPath="/explanation/clustering/#cluster-groups"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ClusterGroupExplanationTooltip;
