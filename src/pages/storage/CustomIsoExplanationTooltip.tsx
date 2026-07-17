import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const CustomIsoExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Upload and manage custom ISO images for instance creation and installation."
      docPath="/howto/instances_create/#instances-create-iso"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default CustomIsoExplanationTooltip;
