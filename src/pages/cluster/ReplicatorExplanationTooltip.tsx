import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ReplicatorExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Configure and manage replication of instances across cluster links."
      docPath="/explanation/replicators/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ReplicatorExplanationTooltip;
