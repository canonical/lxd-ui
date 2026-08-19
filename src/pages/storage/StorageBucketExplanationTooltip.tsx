import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StorageBucketExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Storage buckets store and access unstructured data."
      docPath="/explanation/storage/#storage-buckets"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default StorageBucketExplanationTooltip;
