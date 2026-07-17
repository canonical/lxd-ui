import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const NetworkForwardExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Publish services running on instances across networks."
      docPath="/howto/network_forwards/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default NetworkForwardExplanationTooltip;
