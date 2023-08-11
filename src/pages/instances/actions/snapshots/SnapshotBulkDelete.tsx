import React, { FC, ReactNode, useState } from "react";
import { LxdInstance } from "types/instance";
import { deleteSnapshotBulk } from "api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { pluralizeSnapshot } from "util/instanceBulkActions";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import classnames from "classnames";

interface Props {
  instance: LxdInstance;
  snapshotNames: string[];
  onStart: () => void;
  onFinish: () => void;
  onSuccess: (message: ReactNode) => void;
  onFailure: (title: string, e: unknown) => void;
}

const SnapshotBulkDelete: FC<Props> = ({
  instance,
  snapshotNames,
  onStart,
  onFinish,
  onSuccess,
  onFailure,
}) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const count = snapshotNames.length;

  const handleDelete = () => {
    setLoading(true);
    onStart();
    deleteSnapshotBulk(instance, snapshotNames)
      .then(() =>
        onSuccess(
          <>
            <b>{snapshotNames.length}</b> snapshot
            {snapshotNames.length > 1 && "s"} deleted.
          </>
        )
      )
      .catch((e) => onFailure("Snapshot deletion failed.", e))
      .finally(() => {
        setLoading(false);
        onFinish();
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
      });
  };

  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <>
            This will permanently delete <b>{count}</b>
            {pluralizeSnapshot(count)}
            .<br />
            This action cannot be undone, and can result in data loss.
          </>
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

export default SnapshotBulkDelete;
