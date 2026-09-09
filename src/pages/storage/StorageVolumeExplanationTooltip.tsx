import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StorageVolumeExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--inline"
      explanation="Storage volumes provide storage for instances."
      docPath="/explanation/storage/#storage-volumes"
      docLabel="Learn more about storage volumes"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default StorageVolumeExplanationTooltip;
