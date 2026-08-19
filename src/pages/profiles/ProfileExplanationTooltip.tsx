import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ProfileExplanationTooltip: FC<{
  children?: ReactNode;
  isConfigVariant?: boolean;
}> = ({ children, isConfigVariant }) => {
  return (
    <ExplanationTooltip
      explanation={
        isConfigVariant
          ? "Profiles are configuration templates for instances."
          : "Create and manage configuration templates for instances."
      }
      docPath="/profiles/"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ProfileExplanationTooltip;
