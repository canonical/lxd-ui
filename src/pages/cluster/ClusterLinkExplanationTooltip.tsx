import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ClusterLinkExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="Cluster links connect LXD clusters to share entities."
      docPath="/explanation/clustering/"
      docLabel="Learn more about clustering"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ClusterLinkExplanationTooltip;
