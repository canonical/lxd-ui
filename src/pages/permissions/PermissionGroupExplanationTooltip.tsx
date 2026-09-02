import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PermissionGroupExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="Auth groups organize identities for permission management."
      docPath="/explanation/authorization"
      docLabel="Learn more about authorization"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default PermissionGroupExplanationTooltip;
