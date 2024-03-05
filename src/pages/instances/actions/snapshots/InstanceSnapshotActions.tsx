import { FC, ReactNode, useState } from "react";
import { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import {
  deleteInstanceSnapshot,
  restoreInstanceSnapshot,
} from "api/instance-snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { ConfirmationButton, Icon, List } from "@canonical/react-components";
import classnames from "classnames";
import ItemName from "components/ItemName";
import ConfirmationForce from "components/ConfirmationForce";
import { useEventQueue } from "context/eventQueue";
import InstanceEditSnapshotBtn from "./InstanceEditSnapshotBtn";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  onSuccess: (message: ReactNode) => void;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceSnapshotActions: FC<Props> = ({
  instance,
  snapshot,
  onSuccess,
  onFailure,
}) => {
  const eventQueue = useEventQueue();
  const [isDeleting, setDeleting] = useState(false);
  const [isRestoring, setRestoring] = useState(false);
  const [restoreState, setRestoreState] = useState(true);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setDeleting(true);
    void deleteInstanceSnapshot(instance, snapshot)
      .then((operation) =>
        eventQueue.set(
          operation.metadata.id,
          () =>
            onSuccess(
              <>
                Snapshot <ItemName item={snapshot} bold /> deleted.
              </>,
            ),
          (msg) => onFailure("Snapshot deletion failed", new Error(msg)),
          () => {
            setDeleting(false);
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === queryKeys.instances,
            });
          },
        ),
      )
      .catch((e) => {
        onFailure("Snapshot deletion failed", e);
        setDeleting(false);
      });
  };

  const handleRestore = () => {
    setRestoring(true);
    void restoreInstanceSnapshot(instance, snapshot, restoreState)
      .then((operation) =>
        eventQueue.set(
          operation.metadata.id,
          () =>
            onSuccess(
              <>
                Snapshot <ItemName item={snapshot} bold /> restored.
              </>,
            ),
          (msg) => onFailure("Snapshot restore failed", new Error(msg)),
          () => {
            setRestoring(false);
            void queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === queryKeys.instances,
            });
          },
        ),
      )
      .catch((e) => {
        onFailure("Snapshot restore failed", e);
        setRestoring(false);
      });
  };

  return (
    <>
      <List
        inline
        className={classnames("u-no-margin--bottom", "actions-list", {
          "u-snapshot-actions": !isDeleting && !isRestoring,
        })}
        items={[
          <InstanceEditSnapshotBtn
            key="edit"
            instance={instance}
            snapshot={snapshot}
            onSuccess={onSuccess}
            isDeleting={isDeleting}
            isRestoring={isRestoring}
          />,
          <ConfirmationButton
            key="restore"
            appearance="base"
            loading={isRestoring}
            className="has-icon is-dense"
            title="Confirm restore"
            confirmationModalProps={{
              title: "Confirm restore",
              children: (
                <p>
                  This will restore snapshot <ItemName item={snapshot} bold />.
                  <br />
                  This action cannot be undone, and can result in data loss.
                </p>
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
                <p>
                  This will permanently delete snapshot{" "}
                  <ItemName item={snapshot} bold />.<br />
                  This action cannot be undone, and can result in data loss.
                </p>
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

export default InstanceSnapshotActions;
