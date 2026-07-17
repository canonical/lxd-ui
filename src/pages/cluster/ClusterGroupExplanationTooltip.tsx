import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ClusterGroupExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Group cluster members together to assist with instance placement."
        docPath="/explanation/clustering/#cluster-groups"
      />
    </span>
  );
};

export default ClusterGroupExplanationTooltip;
