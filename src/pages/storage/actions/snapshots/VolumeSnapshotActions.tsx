import type { FC } from "react";
import { useState } from "react";
import type { LxdStorageVolume, LxdVolumeSnapshot } from "types/storage";
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
import ResourceLabel from "components/ResourceLabel";
import VolumeSnapshotLinkChip from "pages/storage/VolumeSnapshotLinkChip";
import ResourceLink from "components/ResourceLink";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";

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
  const { canManageStorageVolumeSnapshots } = useStorageVolumeEntitlements();

  const volumeLink = (
    <ResourceLink
      type="volume"
      value={volume.name}
      to={`/ui/project/${volume.project}/storage/pool/${volume.pool}/volumes/custom/${volume.name}`}
    />
  );

  const getTitle = (action: string) => {
    return !canManageStorageVolumeSnapshots(volume)
      ? `You do not have permission to ${action} this snapshot`
      : `Confirm ${action}`;
  };

  const handleDelete = () => {
    setDeleting(true);
    const snapshotLink = (
      <VolumeSnapshotLinkChip name={snapshot.name} volume={volume} />
    );
    deleteVolumeSnapshot(volume, snapshot)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () =>
            toastNotify.success(
              <>
                Snapshot{" "}
                <ResourceLabel bold type="snapshot" value={snapshot.name} />{" "}
                deleted for volume {volumeLink}.
              </>,
            ),
          (msg) =>
            toastNotify.failure(
              `Snapshot ${snapshot.name} deletion failed`,
              new Error(msg),
              snapshotLink,
            ),
          () => {
            setDeleting(false);
            queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey[0] === queryKeys.volumes ||
                query.queryKey[0] === queryKeys.storage,
            });
          },
        );
      })
      .catch((e) => {
        notify.failure("Snapshot deletion failed", e, snapshotLink);
        setDeleting(false);
      });
  };

  const handleRestore = () => {
    setRestoring(true);
    restoreVolumeSnapshot(volume, snapshot)
      .then(() => {
        toastNotify.success(
          <>
            Snapshot{" "}
            <VolumeSnapshotLinkChip name={snapshot.name} volume={volume} />{" "}
            restored for volume {volumeLink}.
          </>,
        );
      })
      .catch((error: Error) => {
        notify.failure("Snapshot restore failed", error);
      })
      .finally(() => {
        setRestoring(false);
        queryClient.invalidateQueries({
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
              title: getTitle("restore"),
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
            disabled={
              !canManageStorageVolumeSnapshots(volume) ||
              isDeleting ||
              isRestoring
            }
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
              confirmButtonLabel: "Delete snapshot",
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
