import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ProfileExplanationTooltip: FC<{
  children?: ReactNode;
  additionalInformation?: string;
}> = ({ children, additionalInformation }) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--inline"
      explanation={
        additionalInformation
          ? additionalInformation
          : "Profiles are configuration templates for instances."
      }
      docPath="/profiles/"
      docLabel="Learn more about profiles"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ProfileExplanationTooltip;
