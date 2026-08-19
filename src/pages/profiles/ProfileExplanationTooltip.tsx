import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ProfileExplanationTooltip: FC<{
  children?: ReactNode;
}> = ({ children }) => {
  return (
    <ExplanationTooltip
      explanation="Profiles are configuration templates for instances."
      docPath="/profiles/"
      docLabel="Learn more about profiles"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ProfileExplanationTooltip;
