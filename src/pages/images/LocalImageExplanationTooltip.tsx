import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const LocalImageExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="View and manage images stored locally on the LXD server."
        docPath="/image-handling/"
      />
    </span>
  );
};

export default LocalImageExplanationTooltip;
