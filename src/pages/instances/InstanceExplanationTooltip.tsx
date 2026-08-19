import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const InstanceExplanationTooltip: FC<{
  children?: ReactNode;
  isConfigVariant?: boolean;
}> = ({ children, isConfigVariant }) => {
  return (
    <ExplanationTooltip
      explanation={
        isConfigVariant
          ? "Instances are VMs or containers."
          : "Manage and monitor VMs and containers."
      }
      docPath={
        isConfigVariant
          ? "/explanation/instance_config/"
          : "/explanation/instances/"
      }
    >
      {children}
    </ExplanationTooltip>
  );
};

export default InstanceExplanationTooltip;
