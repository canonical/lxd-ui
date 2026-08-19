import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PermissionIdentityExplanationTooltip: FC<{
  children?: ReactNode;
  isConfigVariant?: boolean;
}> = ({ children, isConfigVariant }) => {
  return (
    <ExplanationTooltip
      explanation={
        isConfigVariant
          ? "Identities define access to the LXD server."
          : "Manage users, service accounts, and API keys."
      }
      docPath="/explanation/authorization"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default PermissionIdentityExplanationTooltip;
