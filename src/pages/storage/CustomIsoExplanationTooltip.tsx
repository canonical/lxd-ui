import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const CustomIsoExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="Custom ISOs are images used to boot virtual machines."
      docPath="/howto/instances_create/#instances-create-iso"
      docLabel="Learn more about custom ISOs"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default CustomIsoExplanationTooltip;
