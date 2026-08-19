import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const NetworkExplanationTooltip: FC<{
  children?: ReactNode;
  isConfigVariant?: boolean;
}> = ({ children, isConfigVariant }) => {
  return (
    <ExplanationTooltip
      explanation={
        isConfigVariant
          ? "Networks can be virtual or physical, and connect instances."
          : "Configure and manage virtual and physical networks to connect instances."
      }
      docPath="/explanation/networks/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default NetworkExplanationTooltip;
