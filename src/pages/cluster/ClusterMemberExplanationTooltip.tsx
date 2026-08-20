import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ClusterMemberExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="Cluster members are individual servers that make up an LXD cluster."
      docPath="/explanation/clustering/"
      docLabel="Learn more about clustering"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ClusterMemberExplanationTooltip;
