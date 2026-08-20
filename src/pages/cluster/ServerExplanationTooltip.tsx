import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const ServerExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="The server provides and manages LXD resources and services."
      docPath="/explanation/clustering/"
      docLabel="Learn more about clustering"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default ServerExplanationTooltip;
