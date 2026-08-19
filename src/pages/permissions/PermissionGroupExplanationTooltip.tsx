import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PermissionGroupExplanationTooltip: FC<{
  children?: ReactNode;
  isConfigVariant?: boolean;
}> = ({ children, isConfigVariant }) => {
  return (
    <ExplanationTooltip
      explanation={
        isConfigVariant
          ? "Auth groups facilitate identity permissions."
          : "Organise identities into groups to manage permissions."
      }
      docPath="/explanation/authorization"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default PermissionGroupExplanationTooltip;
