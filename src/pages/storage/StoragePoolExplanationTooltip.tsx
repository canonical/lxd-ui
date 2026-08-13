import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StoragePoolExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Create and manage storage backends used to host instance and image data."
      docPath="/explanation/storage/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default StoragePoolExplanationTooltip;
