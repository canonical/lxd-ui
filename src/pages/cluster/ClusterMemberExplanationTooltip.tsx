import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ClusterMemberExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="View and manage the individual members that make up your LXD cluster."
      docPath="/explanation/clustering/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ClusterMemberExplanationTooltip;
