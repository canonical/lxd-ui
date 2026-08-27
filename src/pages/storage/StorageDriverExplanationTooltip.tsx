import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StorageDriverExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--inline"
      explanation="LXD supports several storage drivers for storing images, instances, and custom volumes."
      docPath="/reference/storage_drivers/"
      docLabel="Learn more about storage drivers"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default StorageDriverExplanationTooltip;
