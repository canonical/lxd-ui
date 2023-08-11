import React, { FC, ReactNode, useState } from "react";
import { LxdInstance, LxdSnapshot } from "types/instance";
import { deleteSnapshot, restoreSnapshot } from "api/snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  Button,
  ConfirmationButton,
  Icon,
  List,
} from "@canonical/react-components";
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
            appearance="base"
            loading={isRestoring}
            className="has-icon is-dense"
            title="Confirm restore"
            confirmationModalProps={{
              title: "Confirm restore",
              children: (
                <>
                  This will restore snapshot <ItemName item={snapshot} bold />.
                  <br />
                  This action cannot be undone, and can result in data loss.
                </>
              ),
              confirmExtra: snapshot.stateful ? (
                <ConfirmationForce
                  label="Restore the instance state"
                  force={[restoreState, setRestoreState]}
                />
              ) : undefined,
              confirmButtonLabel: "Restore",
              confirmButtonAppearance: "positive",
              close: () => setRestoreState(true),
              onConfirm: handleRestore,
            }}
            disabled={isDeleting || isRestoring}
            shiftClickEnabled
            showShiftClickHint
          >
            <Icon name="change-version" />
          </ConfirmationButton>,
          <ConfirmationButton
            key="delete"
            appearance="base"
            loading={isDeleting}
            className="has-icon is-dense"
            confirmationModalProps={{
              title: "Confirm delete",
              children: (
                <>
                  This will permanently delete snapshot{" "}
                  <ItemName item={snapshot} bold />.<br />
                  This action cannot be undone, and can result in data loss.
                </>
              ),
              confirmButtonLabel: "Delete",
              onConfirm: handleDelete,
            }}
            disabled={isDeleting || isRestoring}
            shiftClickEnabled
            showShiftClickHint
          >
            <Icon name="delete" />
          </ConfirmationButton>,
        ]}
      />
    </>
  );
};

export default SnapshotActions;
