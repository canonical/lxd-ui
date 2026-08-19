import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StoragePoolExplanationTooltip: FC<{
  children?: ReactNode;
  isConfigVariant?: boolean;
}> = ({ children, isConfigVariant }) => {
  return (
    <ExplanationTooltip
      explanation={
        isConfigVariant
          ? "Storage pools host instance and image data."
          : "Create and manage storage backends used to host instance and image data."
      }
      docPath={
        isConfigVariant
          ? "/reference/storage_drivers/"
          : "/explanation/storage/"
      }
    >
      {children}
    </ExplanationTooltip>
  );
};

export default StoragePoolExplanationTooltip;
