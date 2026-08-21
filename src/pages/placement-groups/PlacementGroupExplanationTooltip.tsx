import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PlacementGroupExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="Placement groups define rules for placing instances across cluster members."
      docPath="/howto/cluster_placement_groups/"
      docLabel="Learn more about placement groups"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default PlacementGroupExplanationTooltip;
