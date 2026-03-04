import type { FC } from "react";
import type { LxdOperation } from "types/operation";
import { getInstanceName, isRestoringBackup } from "util/operations";

interface Props {
  operation: LxdOperation;
}

const InstanceCreationProgress: FC<Props> = ({ operation }) => {
  const metadata = operation.metadata ?? {};

  if (isRestoringBackup(operation)) {
    return `Restoring backup for ${getInstanceName(operation)}`;
  }

  if (metadata.format_progress_progress) {
    return <div>{metadata.format_progress_progress}</div>;
  }

  const EXCLUDED_KEYS = ["entity_url", "fs"];
  const firstValidEntry = Object.entries(metadata).find(
    ([key]) => !EXCLUDED_KEYS.includes(key),
  );

  if (firstValidEntry) {
    const [key, value] = firstValidEntry;
    return (
      <div>
        {key}: {value}
      </div>
    );
  }

  return null;
};

export default InstanceCreationProgress;
