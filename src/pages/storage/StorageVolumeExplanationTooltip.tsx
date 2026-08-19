import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StorageVolumeExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Storage volumes are used by instances."
      docPath="/explanation/storage/#storage-volumes"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default StorageVolumeExplanationTooltip;
