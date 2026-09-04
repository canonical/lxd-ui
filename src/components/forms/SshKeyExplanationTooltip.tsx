import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const SshKeyExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--inline"
      explanation="Cloud init must be enabled on the instance to apply the keys. Additional keys get applied on instance creation or restart. SSH keys are not removed automatically."
      docPath="/reference/instance_options/"
      docLabel="Learn more about instance options"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default SshKeyExplanationTooltip;
