import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const NetworkForwardExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="Network forwards publish services running on instances across networks."
      docPath="/howto/network_forwards/"
      docLabel="Learn more about network forwards"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default NetworkForwardExplanationTooltip;
