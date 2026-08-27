import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const InstanceExplanationTooltip: FC<{
  children?: ReactNode;
  hasAdditionalInformation?: boolean;
}> = ({ children, hasAdditionalInformation }) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--inline"
      explanation="Instances are VMs or containers."
      docPath={
        hasAdditionalInformation
          ? "/explanation/instance_config/"
          : "/explanation/instances/"
      }
      docLabel={
        hasAdditionalInformation
          ? "Learn more about instance configuration"
          : "Learn more about instances"
      }
    >
      {children}
    </ExplanationTooltip>
  );
};

export default InstanceExplanationTooltip;
