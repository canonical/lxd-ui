import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PermissionIdpGroupExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Map identity provider groups to LXD groups."
        docPath="/explanation/authorization"
      />
    </span>
  );
};

export default PermissionIdpGroupExplanationTooltip;
