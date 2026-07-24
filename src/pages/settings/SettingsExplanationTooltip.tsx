import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const SettingsExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="View and manage global LXD configuration settings and resources."
        docPath="/server/"
      />
    </span>
  );
};

export default SettingsExplanationTooltip;
