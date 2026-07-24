import type { FC, ReactNode } from "react";
import ExplanationTooltip from "components/ExplanationTooltip";

const StorageBucketExplanationTooltip: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return (
    <span className="explanation-tooltip-wrapper">
      {children}
      <ExplanationTooltip
        explanation="Manage object storage buckets for storing and accessing unstructured data."
        docPath="/explanation/storage/#storage-buckets"
      />
    </span>
  );
};

export default StorageBucketExplanationTooltip;
