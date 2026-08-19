import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PlacementGroupExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Placement groups assist with instance placement."
      docPath="/howto/cluster_placement_groups/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default PlacementGroupExplanationTooltip;
