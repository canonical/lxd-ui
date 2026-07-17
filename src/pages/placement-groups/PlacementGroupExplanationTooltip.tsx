import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PlacementGroupExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Define rules to spread or compact instances across cluster members."
      docPath="/howto/cluster_placement_groups/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default PlacementGroupExplanationTooltip;
