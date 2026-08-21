import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PermissionIdentityExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="Identities represent users, service accounts, and API keys."
      docPath="/explanation/authorization"
      docLabel="Learn more about authorization"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default PermissionIdentityExplanationTooltip;
