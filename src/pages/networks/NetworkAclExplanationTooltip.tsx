import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const NetworkAclExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Define network access control rules to control traffic on your networks."
        docPath="/howto/network_acls/"
      />
    </span>
  );
};

export default NetworkAclExplanationTooltip;
