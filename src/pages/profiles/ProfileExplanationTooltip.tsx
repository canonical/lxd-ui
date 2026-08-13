import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ProfileExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Create and manage configuration templates for instances."
      docPath="/profiles/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ProfileExplanationTooltip;
