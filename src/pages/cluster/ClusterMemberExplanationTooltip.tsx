import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ClusterMemberExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="View and manage the individual members that make up your LXD cluster."
        docPath="/explanation/clustering/"
      />
    </span>
  );
};

export default ClusterMemberExplanationTooltip;
