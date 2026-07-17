import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PermissionGroupExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Organise identities into groups to facilitate permission management."
        docPath="/explanation/authorization"
      />
    </span>
  );
};

export default PermissionGroupExplanationTooltip;
