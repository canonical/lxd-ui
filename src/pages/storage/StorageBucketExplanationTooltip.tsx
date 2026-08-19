import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StorageBucketExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Storage buckets store and provide access to unstructured data."
      docPath="/explanation/storage/#storage-buckets"
      docLabel="Learn more about storage buckets"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default StorageBucketExplanationTooltip;
