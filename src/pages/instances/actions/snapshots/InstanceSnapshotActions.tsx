import type { FC, ReactNode } from "react";
import { useState } from "react";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
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
import CreateImageFromInstanceSnapshotBtn from "pages/instances/actions/snapshots/CreateImageFromInstanceSnapshotBtn";
import CreateInstanceFromSnapshotBtn from "./CreateInstanceFromSnapshotBtn";
import ResourceLabel from "components/ResourceLabel";
import InstanceSnapshotLinkChip from "pages/instances/InstanceSnapshotLinkChip";
import InstanceLinkChip from "pages/instances/InstanceLinkChip";
import { useInstanceEntitlements } from "util/entitlements/instances";

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
  const { canManageInstanceSnapshots } = useInstanceEntitlements();
  const disabledReason = canManageInstanceSnapshots(instance)
    ? undefined
    : "You do not have permission to manage snapshots for this instance";

  const handleDelete = () => {
    setDeleting(true);
    deleteInstanceSnapshot(instance, snapshot)
      .then((operation) =>
        eventQueue.set(
          operation.metadata.id,
          () =>
            onSuccess(
              <>
                Snapshot{" "}
                <ResourceLabel bold type="snapshot" value={snapshot.name} />{" "}
                deleted for instance <InstanceLinkChip instance={instance} />.
              </>,
            ),
          (msg) => onFailure("Snapshot deletion failed", new Error(msg)),
          () => {
            setDeleting(false);
            queryClient.invalidateQueries({
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
    restoreInstanceSnapshot(instance, snapshot, restoreState)
      .then((operation) =>
        eventQueue.set(
          operation.metadata.id,
          () =>
            onSuccess(
              <>
                Snapshot{" "}
                <InstanceSnapshotLinkChip
                  name={snapshot.name}
                  instance={instance}
                />{" "}
                restored for instance <InstanceLinkChip instance={instance} />.
              </>,
            ),
          (msg) => onFailure("Snapshot restore failed", new Error(msg)),
          () => {
            setRestoring(false);
            queryClient.invalidateQueries({
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
            disabledReason={disabledReason}
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
              confirmButtonLabel: disabledReason ?? "Restore snapshot",
              confirmButtonAppearance: "positive",
              close: () => setRestoreState(true),
              onConfirm: handleRestore,
            }}
            disabled={isDeleting || isRestoring || !!disabledReason}
            shiftClickEnabled
            showShiftClickHint
          >
            <Icon name="change-version" />
          </ConfirmationButton>,
          <CreateImageFromInstanceSnapshotBtn
            key="publish"
            instance={instance}
            snapshot={snapshot}
            isRestoring={isRestoring}
            isDeleting={isDeleting}
          />,
          <CreateInstanceFromSnapshotBtn
            key="duplicate"
            instance={instance}
            snapshot={snapshot}
            isDeleting={isDeleting}
            isRestoring={isRestoring}
          />,
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
              confirmButtonLabel: disabledReason ?? "Delete snapshot",
              onConfirm: handleDelete,
            }}
            disabled={isDeleting || isRestoring || !!disabledReason}
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
