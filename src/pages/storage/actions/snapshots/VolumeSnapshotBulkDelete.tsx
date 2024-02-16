import { FC, useState } from "react";
import { deleteVolumeSnapshotBulk } from "api/volume-snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { pluralize } from "util/instanceBulkActions";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import classnames from "classnames";
import { useEventQueue } from "context/eventQueue";
import { getPromiseSettledCounts } from "util/helpers";
import { LxdStorageVolume } from "types/storage";
import { useToastNotification } from "context/toastNotificationProvider";

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
    void deleteVolumeSnapshotBulk(volume, snapshotNames, eventQueue).then(
      (results) => {
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
        void queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === queryKeys.volumes ||
            query.queryKey[0] === queryKeys.storage,
        });
        setLoading(false);
        onFinish();
      },
    );
  };

  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete <b>{count}</b>{" "}
            {pluralize("snapshot", count)}
            .<br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      disabled={isLoading}
      className={classnames({ "has-icon": isLoading })}
      onHoverText="Delete snapshots"
      shiftClickEnabled
      showShiftClickHint
    >
      {isLoading && <Icon name="spinner" />}
      <span>Delete snapshots</span>
    </ConfirmationButton>
  );
};

export default VolumeSnapshotBulkDelete;
