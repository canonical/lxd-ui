import classNames from "classnames";
import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StoragePoolExplanationTooltip: FC<{
  children?: ReactNode;
  className?: string;
  hasAdditionalInformation?: boolean;
}> = ({ children, className, hasAdditionalInformation }) => {
  return (
    <ExplanationTooltip
      className={classNames("explanation-tooltip-wrapper--inline", className)}
      explanation="Storage pools host instance and image data."
      docPath={
        hasAdditionalInformation
          ? "/reference/storage_drivers/"
          : "/explanation/storage/"
      }
      docLabel={
        hasAdditionalInformation
          ? "Learn more about storage drivers"
          : "Learn more about storage"
      }
    >
      {children}
    </ExplanationTooltip>
  );
};

export default StoragePoolExplanationTooltip;
