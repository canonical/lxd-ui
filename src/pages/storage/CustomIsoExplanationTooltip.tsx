import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const CustomIsoExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Upload and manage custom ISO images for instance creation and installation."
        docPath="/howto/instances_create/#instances-create-iso"
      />
    </span>
  );
};

export default CustomIsoExplanationTooltip;
