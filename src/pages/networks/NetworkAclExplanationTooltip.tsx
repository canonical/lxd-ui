import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const NetworkAclExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Define network access control rules to direct traffic on your networks."
      docPath="/howto/network_acls/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default NetworkAclExplanationTooltip;
