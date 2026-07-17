import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ImageRegistryExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Configure external image sources for importing images."
        docPath="/image-handling/"
      />
    </span>
  );
};

export default ImageRegistryExplanationTooltip;
