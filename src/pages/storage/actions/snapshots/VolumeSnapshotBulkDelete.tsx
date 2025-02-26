import type { FC } from "react";
import { useState } from "react";
import { deleteVolumeSnapshotBulk } from "api/volume-snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { pluralize } from "util/instanceBulkActions";
import { useEventQueue } from "context/eventQueue";
import { getPromiseSettledCounts } from "util/helpers";
import type { LxdStorageVolume } from "types/storage";
import { useToastNotification } from "context/toastNotificationProvider";
import BulkDeleteButton from "components/BulkDeleteButton";

interface Props {
  volume: LxdStorageVolume;
  snapshotNames: string[];
  onStart: () => void;
  onFinish: () => void;
}

const VolumeSnapshotBulkDelete: FC<Props> = ({
  volume,
  snapshotNames,
  onStart,
  onFinish,
}) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const count = snapshotNames.length;

  const handleDelete = () => {
    setLoading(true);
    onStart();
    deleteVolumeSnapshotBulk(volume, snapshotNames, eventQueue)
      .then((results) => {
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);
        if (fulfilledCount === count) {
          toastNotify.success(
            `${snapshotNames.length} ${pluralize(
              "snapshot",
              snapshotNames.length,
            )} deleted`,
          );
        } else if (rejectedCount === count) {
          toastNotify.failure(
            "Snapshot bulk deletion failed",
            undefined,
            <>
              <b>{count}</b> {pluralize("snapshot", count)} could not be
              deleted.
            </>,
          );
        } else {
          toastNotify.failure(
            "Snapshot bulk deletion partially failed",
            undefined,
            <>
              <b>{fulfilledCount}</b> {pluralize("snapshot", fulfilledCount)}{" "}
              deleted.
              <br />
              <b>{rejectedCount}</b> {pluralize("snapshot", rejectedCount)}{" "}
              could not be deleted.
            </>,
          );
        }
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === queryKeys.volumes ||
            query.queryKey[0] === queryKeys.storage,
        });
        setLoading(false);
        onFinish();
      })
      .catch((e) => {
        toastNotify.failure("Snapshot bulk deletion failed", e);
        setLoading(false);
      });
  };

  return (
    <BulkDeleteButton
      confirmationButtonProps={{
        loading: isLoading,
        disabled: isLoading,
        appearance: "",
      }}
      onDelete={handleDelete}
      entityType="snapshot"
      entities={snapshotNames}
      deletableEntities={snapshotNames}
      buttonLabel={`Delete ${pluralize("snapshot", snapshotNames.length)}`}
    />
  );
};

export default VolumeSnapshotBulkDelete;
