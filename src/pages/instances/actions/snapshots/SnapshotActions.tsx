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
  onFailure: (message: ReactNode, e: unknown) => void;
}

const SnapshotActions: FC<Props> = ({
  instance,
  snapshot,
  onSuccess,
  onFailure,
}) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteSnapshot(instance, snapshot)
      .then(() =>
        onSuccess(
          <>
            Snapshot <ItemName item={snapshot} bold /> deleted.
          </>
        )
      )
      .catch((e) => onFailure("Error on snapshot delete.", e))
      .finally(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
      });
  };

  const handleRestore = () => {
    setLoading(true);
    restoreSnapshot(instance, snapshot)
      .then(() =>
        onSuccess(
          <>
            Snapshot <ItemName item={snapshot} bold /> restored.
          </>
        )
      )
      .catch((e) => onFailure("Error on snapshot restore.", e))
      .finally(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.instances,
        });
      });
  };

  return (
    <List
      inline
      className={classnames("u-no-margin--bottom", {
        "u-snapshot-actions": !isLoading,
      })}
      items={[
        <ConfirmationButton
          key="delete"
          isLoading={isLoading}
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
          isDisabled={isLoading}
        />,
        <ConfirmationButton
          key="restore"
          isLoading={isLoading}
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
          isDisabled={isLoading}
        />,
      ]}
    />
  );
};

export default SnapshotActions;
