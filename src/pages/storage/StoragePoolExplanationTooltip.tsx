import classNames from "classnames";
import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StoragePoolExplanationTooltip: FC<{
  children?: ReactNode;
  className?: string;
  isConfigVariant?: boolean;
}> = ({ children, className, isConfigVariant }) => {
  return (
    <ExplanationTooltip
      className={classNames("explanation-tooltip-wrapper--inline", className)}
      explanation="Storage pools host data from instances, images and more."
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
