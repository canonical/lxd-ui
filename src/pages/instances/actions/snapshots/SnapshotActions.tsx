import React, { FC, ReactNode, useState } from "react";
import { LxdInstance, LxdSnapshot } from "types/instance";
import { deleteSnapshot, restoreSnapshot } from "api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ConfirmationButton from "components/ConfirmationButton";
import { List } from "@canonical/react-components";
import classnames from "classnames";
import ItemName from "components/ItemName";

interface Props {
  instance: LxdInstance;
  snapshot: LxdSnapshot;
  onSuccess: (message: ReactNode) => void;
  onFailure: (title: string, e: unknown) => void;
}

const SnapshotActions: FC<Props> = ({
  instance,
  snapshot,
  onSuccess,
  onFailure,
}) => {
  const [isDeleting, setDeleting] = useState(false);
  const [isRestoring, setRestoring] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setDeleting(true);
    deleteSnapshot(instance, snapshot)
      .then(() =>
        onSuccess(
          <>
            Snapshot <ItemName item={snapshot} bold /> deleted.
          </>
        )
      )
      .catch((e) => onFailure("Snapshot deletion failed", e))
      .finally(() => {
        setDeleting(false);
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
      });
  };

  const handleRestore = () => {
    setRestoring(true);
    restoreSnapshot(instance, snapshot)
      .then(() =>
        onSuccess(
          <>
            Snapshot <ItemName item={snapshot} bold /> restored.
          </>
        )
      )
      .catch((e) => onFailure("Snapshot restore failed", e))
      .finally(() => {
        setRestoring(false);
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
      });
  };

  return (
    <List
      inline
      className={classnames("u-no-margin--bottom", {
        "u-snapshot-actions": !isDeleting && !isRestoring,
      })}
      items={[
        <ConfirmationButton
          key="delete"
          isLoading={isDeleting}
          icon={isDeleting ? "spinner" : undefined}
          title="Confirm delete"
          toggleCaption="Delete"
          confirmationMessage={
            <>
              Are you sure you want to delete snapshot{" "}
              <ItemName item={snapshot} bold />?{"\n"}This action cannot be
              undone, and can result in data loss.
            </>
          }
          posButtonLabel="Delete"
          onConfirm={handleDelete}
          isDisabled={isDeleting || isRestoring}
        />,
        <ConfirmationButton
          key="restore"
          isLoading={isRestoring}
          icon={isRestoring ? "spinner" : undefined}
          title="Confirm restore"
          toggleCaption="Restore"
          confirmationMessage={
            <>
              Are you sure you want to restore snapshot{" "}
              <ItemName item={snapshot} bold />?{"\n"}This action cannot be
              undone, and can result in data loss.
            </>
          }
          posButtonLabel="Restore"
          onConfirm={handleRestore}
          isDisabled={isDeleting || isRestoring}
        />,
      ]}
    />
  );
};

export default SnapshotActions;
