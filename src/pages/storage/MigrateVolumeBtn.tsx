import type { FC } from "react";
import { useState } from "react";
import { ActionButton, Icon } from "@canonical/react-components";
import { usePortal } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";
import type { LxdStorageVolume } from "types/storage";
import MigrateVolumeModal from "./MigrateVolumeModal";
import { useNavigate } from "react-router-dom";
import ResourceLabel from "components/ResourceLabel";
import ResourceLink from "components/ResourceLink";
import { migrateStorageVolume } from "api/storage-volumes";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";
import { hasLocation } from "util/storageVolume";
import VolumeLinkChip from "pages/storage/VolumeLinkChip";
import classNames from "classnames";

interface Props {
  volume: LxdStorageVolume;
  project: string;
  classname?: string;
  onClose?: () => void;
}

const MigrateVolumeBtn: FC<Props> = ({
  volume,
  project,
  classname,
  onClose,
}) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isVolumeLoading, setVolumeLoading] = useState(false);
  const { canEditVolume } = useStorageVolumeEntitlements();

  const handleSuccess = (
    newTarget: string,
    storageVolume: LxdStorageVolume,
  ) => {
    const memberPath = hasLocation(volume) ? `/member/${volume.location}` : "";
    const oldVolumeUrl = `/ui/project/${storageVolume.project}/storage/pool/${storageVolume.pool}${memberPath}/volumes/${storageVolume.type}/${storageVolume.name}`;
    const newVolumeUrl = `/ui/project/${storageVolume.project}/storage/pool/${newTarget}${memberPath}/volumes/${storageVolume.type}/${storageVolume.name}`;

    const volumeLink = (
      <ResourceLink
        type="volume"
        value={storageVolume.name}
        to={newVolumeUrl}
      />
    );
    const poolLink = (
      <ResourceLink
        type="pool"
        value={newTarget}
        to={`/ui/project/${storageVolume.project}/storage/pool/${newTarget}`}
      />
    );
    toastNotify.success(
      <>
        Volume {volumeLink} successfully migrated to pool {poolLink}
      </>,
    );

    if (window.location.pathname.startsWith(oldVolumeUrl)) {
      navigate(newVolumeUrl);
    }
  };

  const notifyFailure = (
    e: unknown,
    volumeName: string,
    targetPool: string,
  ) => {
    setVolumeLoading(false);
    toastNotify.failure(
      `Migration failed for volume ${volumeName} to pool ${targetPool}`,
      e,
      <VolumeLinkChip volume={volume} />,
    );
  };

  const handleFailure = (
    msg: string,
    storageVolume: string,
    targetPool: string,
  ) => {
    notifyFailure(new Error(msg), storageVolume, targetPool);
  };

  const handleFinish = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.storage, volume.name],
    });
    setVolumeLoading(false);
  };

  const handleMigrate = (targetPool: string) => {
    setVolumeLoading(true);
    migrateStorageVolume(volume, targetPool, volume.project, volume.location)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            handleSuccess(targetPool, volume);
          },
          (err) => {
            handleFailure(err, volume.name, targetPool);
          },
          handleFinish,
        );
        const volumeLabel = (
          <ResourceLabel bold type="volume" value={volume.name} />
        );
        const poolLink = (
          <ResourceLink
            type="pool"
            value={targetPool}
            to={`/ui/project/${volume.project}/storage/pool/${targetPool}`}
          />
        );
        toastNotify.info(
          <>
            Migration started for volume {volumeLabel} to pool {poolLink}
          </>,
        );
        queryClient.invalidateQueries({
          queryKey: [queryKeys.storage, volume.name, project],
        });
      })
      .catch((e) => {
        notifyFailure(e, volume.name, targetPool);
      })
      .finally(() => {
        handleClose();
      });
  };

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <MigrateVolumeModal
            close={handleClose}
            migrate={handleMigrate}
            storageVolume={volume}
          />
        </Portal>
      )}
      <ActionButton
        onClick={openPortal}
        type="button"
        className={classNames("u-no-margin--bottom has-icon", classname)}
        loading={isVolumeLoading}
        disabled={!canEditVolume(volume) || isVolumeLoading}
        title={
          canEditVolume(volume)
            ? "Migrate volume"
            : "You do not have permission to migrate this volume"
        }
      >
        <Icon name="machines" />
        <span>Migrate</span>
      </ActionButton>
    </>
  );
};

export default MigrateVolumeBtn;
