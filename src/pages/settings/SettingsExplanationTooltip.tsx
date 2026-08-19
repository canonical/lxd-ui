import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const SettingsExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="View and manage global LXD configuration settings and resources."
      docPath="/server/"
      docLabel="Learn more about server configuration"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default SettingsExplanationTooltip;
