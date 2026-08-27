import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ReplicatorExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--inline"
      explanation="Replicators copy instances between clusters across cluster links."
      docPath="/explanation/replicators/"
      docLabel="Learn more about replicators"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ReplicatorExplanationTooltip;
