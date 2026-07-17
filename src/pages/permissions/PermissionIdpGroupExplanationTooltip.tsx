import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PermissionIdpGroupExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Map identity provider groups to LXD groups."
      docPath="/explanation/authorization/#use-groups-defined-by-the-identity-provider"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default PermissionIdpGroupExplanationTooltip;
