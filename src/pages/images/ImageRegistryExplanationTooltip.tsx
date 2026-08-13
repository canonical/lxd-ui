import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ImageRegistryExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Configure external image sources for importing images."
      docPath="/image-handling/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ImageRegistryExplanationTooltip;
