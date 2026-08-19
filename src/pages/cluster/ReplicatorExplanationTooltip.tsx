import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ReplicatorExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Cluster replicators copy instances from one cluster to another across cluster links."
      docPath="/explanation/replicators/"
      docLabel="Learn more about replicators"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ReplicatorExplanationTooltip;
