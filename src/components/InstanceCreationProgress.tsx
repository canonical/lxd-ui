import type { FC } from "react";
import type { LxdOperation } from "types/operation";
import { getInstanceName, isRestoringBackup } from "util/operations";
import { useOperations } from "context/operationsProvider";

interface Props {
  operation: LxdOperation;
}

const InstanceCreationProgress: FC<Props> = ({ operation }) => {
  const { operationProgress } = useOperations();

  const metadata =
    operation.id in operationProgress
      ? operationProgress[operation.id]
      : (operation.metadata ?? {});

  if (isRestoringBackup(operation)) {
    return `Restoring backup for ${getInstanceName(operation)}`;
  }

  if (metadata.format_progress_progress) {
    return <div>{metadata.format_progress_progress}</div>;
  }

  const firstValidEntry = Object.entries(metadata).find(([key]) =>
    key.endsWith("_progress"),
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
