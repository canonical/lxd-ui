import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const OperationExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Track background tasks performed by LXD."
      docPath="/events/"
      docLabel="Learn more about events"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default OperationExplanationTooltip;
