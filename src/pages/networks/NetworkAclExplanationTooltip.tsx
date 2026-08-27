import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const NetworkAclExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--inline"
      explanation="ACLs define network access control rules for traffic on your networks."
      docPath="/howto/network_acls/"
      docLabel="Learn more about network ACLs"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default NetworkAclExplanationTooltip;
