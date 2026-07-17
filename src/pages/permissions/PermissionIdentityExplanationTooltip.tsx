import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PermissionIdentityExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Manage users, service accounts, and authentication identities."
        docPath="/explanation/authorization"
      />
    </span>
  );
};

export default PermissionIdentityExplanationTooltip;
