import { FC, ReactNode, useState } from "react";
import { LxdInstance } from "types/instance";
import { deleteInstanceSnapshotBulk } from "api/instance-snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { pluralize } from "util/instanceBulkActions";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import classnames from "classnames";
import { useEventQueue } from "context/eventQueue";
import { getPromiseSettledCounts } from "util/helpers";

interface Props {
  instance: LxdInstance;
  snapshotNames: string[];
  onStart: () => void;
  onFinish: () => void;
  onSuccess: (message: ReactNode) => void;
  onFailure: (title: string, e: unknown, message?: ReactNode) => void;
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

  const count = snapshotNames.length;

  const handleDelete = () => {
    setLoading(true);
    onStart();
    void deleteInstanceSnapshotBulk(instance, snapshotNames, eventQueue).then(
      (results) => {
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);
        if (fulfilledCount === count) {
          onSuccess(
            <>
              <b>{snapshotNames.length}</b>{" "}
              {pluralize("snapshot", snapshotNames.length)} deleted.
            </>,
          );
        } else if (rejectedCount === count) {
          onFailure(
            "Snapshot bulk deletion failed",
            undefined,
            <>
              <b>{count}</b> {pluralize("snapshot", count)} could not be
              deleted.
            </>,
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
          );
        }
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
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

export default InstanceSnapshotBulkDelete;
