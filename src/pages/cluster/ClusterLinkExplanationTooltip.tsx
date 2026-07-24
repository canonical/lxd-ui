import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ClusterLinkExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Connect and manage links between clusters to share entities."
        docPath="/explanation/clustering/"
      />
    </span>
  );
};

export default ClusterLinkExplanationTooltip;
