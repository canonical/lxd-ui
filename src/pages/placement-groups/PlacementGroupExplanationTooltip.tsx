import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PlacementGroupExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Define rules to control how instances are distributed across cluster members."
        docPath="/howto/cluster_placement_groups/"
      />
    </span>
  );
};

export default PlacementGroupExplanationTooltip;
