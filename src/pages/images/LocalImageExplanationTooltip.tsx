import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const LocalImageExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="View and manage images stored locally on the LXD server."
      docPath="/image-handling/"
      docLabel="Learn more about images"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default LocalImageExplanationTooltip;
