import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ProfileExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Create and manage reusable configuration templates that can be applied to instances."
        docPath="/profiles/"
      />
    </span>
  );
};

export default ProfileExplanationTooltip;
