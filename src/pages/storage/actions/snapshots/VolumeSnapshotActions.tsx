import { FC, useState } from "react";
import { LxdStorageVolume, LxdVolumeSnapshot } from "types/storage";
import {
  deleteVolumeSnapshot,
  restoreVolumeSnapshot,
} from "api/volume-snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  List,
  useNotify,
} from "@canonical/react-components";
import classnames from "classnames";
import ItemName from "components/ItemName";
import { useEventQueue } from "context/eventQueue";
import VolumeEditSnapshotBtn from "./VolumeEditSnapshotBtn";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  volume: LxdStorageVolume;
  snapshot: LxdVolumeSnapshot;
}

const VolumeSnapshotActions: FC<Props> = ({ volume, snapshot }) => {
  const eventQueue = useEventQueue();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isDeleting, setDeleting] = useState(false);
  const [isRestoring, setRestoring] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setDeleting(true);
    void deleteVolumeSnapshot(volume, snapshot)
      .then((operation) =>
        eventQueue.set(
          operation.metadata.id,
          () => toastNotify.success(`Snapshot ${snapshot.name} deleted`),
          (msg) =>
            toastNotify.failure(
              `Snapshot ${snapshot.name} deletion failed`,
              new Error(msg),
            ),
          () => {
            setDeleting(false);
            void queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey[0] === queryKeys.volumes ||
                query.queryKey[0] === queryKeys.storage,
            });
          },
        ),
      )
      .catch((e) => {
        notify.failure("Snapshot deletion failed", e);
        setDeleting(false);
      });
  };

  const handleRestore = () => {
    setRestoring(true);
    void restoreVolumeSnapshot(volume, snapshot)
      .then(() => {
        toastNotify.success(`Snapshot ${snapshot.name} restored`);
      })
      .catch((error: Error) => {
        notify.failure("Snapshot restore failed", error);
      })
      .finally(() => {
        setRestoring(false);
        void queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === queryKeys.volumes ||
            query.queryKey[0] === queryKeys.storage,
        });
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
          <VolumeEditSnapshotBtn
            key="edit"
            volume={volume}
            snapshot={snapshot}
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
              confirmButtonLabel: "Restore",
              confirmButtonAppearance: "positive",
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

export default VolumeSnapshotActions;
