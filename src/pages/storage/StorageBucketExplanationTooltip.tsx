import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StorageBucketExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <ExplanationTooltip
      explanation="Manage object storage buckets for storing and accessing unstructured data."
      docPath="/explanation/storage/#storage-buckets"
    >
      {children}
    </ExplanationTooltip>
  );
};

export default StorageBucketExplanationTooltip;
