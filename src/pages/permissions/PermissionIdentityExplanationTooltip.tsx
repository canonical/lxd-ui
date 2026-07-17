import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PermissionIdentityExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Manage users, service accounts, and API keys."
      docPath="/explanation/authorization"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default PermissionIdentityExplanationTooltip;
