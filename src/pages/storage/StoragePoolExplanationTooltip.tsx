import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StoragePoolExplanationTooltip: FC<{
  children?: ReactNode;
  isConfigVariant?: boolean;
}> = ({ children, isConfigVariant }) => {
  return (
    <ExplanationTooltip
      explanation="Storage pools host instance and image data."
      docPath={
        isConfigVariant
          ? "/reference/storage_drivers/"
          : "/explanation/storage/"
      }
      docLabel={
        isConfigVariant
          ? "Learn more about storage drivers"
          : "Learn more about storage"
      }
    >
      {children}
    </ExplanationTooltip>
  );
};

export default StoragePoolExplanationTooltip;
