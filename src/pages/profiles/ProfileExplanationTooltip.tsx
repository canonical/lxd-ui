import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ProfileExplanationTooltip: FC<{
  children?: ReactNode;
  hasAdditionalInformation?: boolean;
}> = ({ children, hasAdditionalInformation }) => {
  return (
    <ExplanationTooltip
      className="explanation-tooltip-wrapper--inline"
      explanation={
        hasAdditionalInformation
          ? "Profiles are configuration templates for instances. Profiles lower in this list take precedence and override values from profiles above."
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
