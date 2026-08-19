import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ImageRegistryExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Image registries connect to other LXD clusters to use custom images."
      docPath="/image-handling/"
      docLabel="Learn more about image registries"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ImageRegistryExplanationTooltip;
