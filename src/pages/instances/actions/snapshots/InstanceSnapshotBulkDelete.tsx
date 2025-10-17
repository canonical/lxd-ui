import type { FC, ReactNode } from "react";
import { useState } from "react";
import type { LxdInstance } from "types/instance";
import { deleteInstanceSnapshotBulk } from "api/instance-snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { pluralize } from "util/instanceBulkActions";
import { useEventQueue } from "context/eventQueue";
import { getPromiseSettledCounts } from "util/promises";
import { useInstanceEntitlements } from "util/entitlements/instances";
import BulkDeleteButton from "components/BulkDeleteButton";
import { useBulkDetails } from "context/useBulkDetails";
import type { NotificationAction } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
  snapshotNames: string[];
  onStart: () => void;
  onFinish: () => void;
  onSuccess: (message: ReactNode, actions?: NotificationAction[]) => void;
  onFailure: (
    title: string,
    e: unknown,
    message?: ReactNode,
    actions?: NotificationAction[],
  ) => void;
}

const InstanceSnapshotBulkDelete: FC<Props> = ({
  instance,
  snapshotNames,
  onStart,
  onFinish,
  onSuccess,
  onFailure,
}) => {
  const eventQueue = useEventQueue();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canManageInstanceSnapshots } = useInstanceEntitlements();
  const viewBulkDetails = useBulkDetails();

  const count = snapshotNames.length;

  const handleDelete = () => {
    setLoading(true);
    onStart();
    deleteInstanceSnapshotBulk(instance, snapshotNames, eventQueue)
      .then((results) => {
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);
        if (fulfilledCount === count) {
          onSuccess(
            <>
              <b>{snapshotNames.length}</b>{" "}
              {pluralize("snapshot", snapshotNames.length)} deleted.
            </>,
            viewBulkDetails(results),
          );
        } else if (rejectedCount === count) {
          onFailure(
            "Snapshot bulk deletion failed",
            undefined,
            <>
              <b>{count}</b> {pluralize("snapshot", count)} could not be
              deleted.
            </>,
            viewBulkDetails(results),
          );
        } else {
          onFailure(
            "Snapshot bulk deletion partially failed",
            undefined,
            <>
              <b>{fulfilledCount}</b> {pluralize("snapshot", fulfilledCount)}{" "}
              deleted.
              <br />
              <b>{rejectedCount}</b> {pluralize("snapshot", rejectedCount)}{" "}
              could not be deleted.
            </>,
            viewBulkDetails(results),
          );
        }
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
        setLoading(false);
        onFinish();
      })
      .catch((e) => {
        onFailure("Snapshot bulk deletion failed", e);
        setLoading(false);
      });
  };

  return (
    <BulkDeleteButton
      confirmationButtonProps={{
        loading: isLoading,
        disabled: isLoading || !canManageInstanceSnapshots(instance),
        appearance: "",
      }}
      onDelete={handleDelete}
      entityType="snapshot"
      entities={snapshotNames}
      deletableEntities={snapshotNames}
      disabledReason={
        canManageInstanceSnapshots(instance)
          ? undefined
          : "You do not have permission to manage snapshots for this instance"
      }
      buttonLabel={`Delete ${pluralize("snapshot", snapshotNames.length)}`}
    />
  );
};

export default InstanceSnapshotBulkDelete;
