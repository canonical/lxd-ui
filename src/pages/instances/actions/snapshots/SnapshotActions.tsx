import React, { FC, ReactNode, useState } from "react";
import { LxdInstance, LxdSnapshot } from "types/instance";
import { deleteSnapshot, restoreSnapshot } from "api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ConfirmationButton from "components/ConfirmationButton";
import { Button, Icon, List } from "@canonical/react-components";
import classnames from "classnames";
import ItemName from "components/ItemName";
import ConfirmationForce from "components/ConfirmationForce";
import EditSnapshotForm from "./EditSnapshotForm";

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
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isDeleting, setDeleting] = useState(false);
  const [isRestoring, setRestoring] = useState(false);
  const [restoreState, setRestoreState] = useState(true);
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
    restoreSnapshot(instance, snapshot, restoreState)
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
    <>
      {isModalOpen && (
        <EditSnapshotForm
          instance={instance}
          snapshot={snapshot}
          close={() => setModalOpen(false)}
          onSuccess={onSuccess}
        />
      )}
      <List
        inline
        className={classnames("u-no-margin--bottom", "actions-list", {
          "u-snapshot-actions": !isDeleting && !isRestoring,
        })}
        items={[
          <Button
            key="edit"
            appearance="base"
            hasIcon
            dense={true}
            disabled={isDeleting || isRestoring}
            onClick={() => setModalOpen(true)}
            type="button"
            aria-label="Edit snapshot"
            title="Edit"
          >
            <Icon name="edit" />
          </Button>,
          <ConfirmationButton
            key="restore"
            toggleAppearance="base"
            isLoading={isRestoring}
            icon="change-version"
            title="Confirm restore"
            confirmMessage={
              <>
                Are you sure you want to restore snapshot{" "}
                <ItemName item={snapshot} bold />?{"\n"}This action cannot be
                undone, and can result in data loss.
              </>
            }
            confirmExtra={
              snapshot.stateful ? (
                <ConfirmationForce
                  label="Restore the instance state"
                  force={[restoreState, setRestoreState]}
                />
              ) : undefined
            }
            confirmButtonLabel="Restore"
            confirmButtonAppearance="positive"
            onCancel={() => setRestoreState(true)}
            onConfirm={handleRestore}
            isDense={true}
            isDisabled={isDeleting || isRestoring}
          />,
          <ConfirmationButton
            key="delete"
            toggleAppearance="base"
            isLoading={isDeleting}
            icon="delete"
            title="Confirm delete"
            confirmMessage={
              <>
                Are you sure you want to delete snapshot{" "}
                <ItemName item={snapshot} bold />?{"\n"}This action cannot be
                undone, and can result in data loss.
              </>
            }
            confirmButtonLabel="Delete"
            onConfirm={handleDelete}
            isDense={true}
            isDisabled={isDeleting || isRestoring}
          />,
        ]}
      />
    </>
  );
};

export default SnapshotActions;
