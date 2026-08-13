import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PermissionGroupExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Organise identities into groups to manage permissions."
      docPath="/explanation/authorization"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default PermissionGroupExplanationTooltip;
