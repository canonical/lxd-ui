import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const SettingsExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Settings control global LXD configuration."
      docPath="/server/"
      docLabel="Learn more about server configuration"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default SettingsExplanationTooltip;
