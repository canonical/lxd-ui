import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ReplicatorExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Configure and manage replication of instances across Cluster links."
        docPath="/explanation/replicators/"
      />
    </span>
  );
};

export default ReplicatorExplanationTooltip;
