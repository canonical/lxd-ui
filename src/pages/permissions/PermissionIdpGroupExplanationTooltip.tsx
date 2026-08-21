import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const PermissionIdpGroupExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="IDP groups map identity provider groups to LXD groups."
      docPath="/explanation/authorization/#use-groups-defined-by-the-identity-provider"
      docLabel="Learn more about IDP groups"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default PermissionIdpGroupExplanationTooltip;
