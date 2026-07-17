import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StorageVolumeExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Provision and manage storage volumes for use by instances."
        docPath="/explanation/storage/#storage-volumes"
      />
    </span>
  );
};

export default StorageVolumeExplanationTooltip;
