import type { FC } from "react";
import { useState } from "react";
import { ActionButton, Icon } from "@canonical/react-components";
import { usePortal } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";
import type { LxdStorageVolume } from "types/storage";
import MoveVolumeModal from "./MoveVolumeModal";
import { useNavigate } from "react-router-dom";
import ResourceLabel from "components/ResourceLabel";
import ResourceLink from "components/ResourceLink";
import { moveStorageVolume } from "api/storage-volumes";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";

interface Props {
  storageVolume: LxdStorageVolume;
  project: string;
  classname?: string;
  onClose?: () => void;
}

const MoveVolumeBtn: FC<Props> = ({
  storageVolume,
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
    const oldVolumeUrl = `/ui/project/${storageVolume.project}/storage/pool/${storageVolume.pool}/volumes/${storageVolume.type}/${storageVolume.name}`;
    const newVolumeUrl = `/ui/project/${storageVolume.project}/storage/pool/${newTarget}/volumes/${storageVolume.type}/${storageVolume.name}`;

    const volume = (
      <ResourceLink
        type="volume"
        value={storageVolume.name}
        to={newVolumeUrl}
      />
    );
    const pool = (
      <ResourceLink
        type="pool"
        value={newTarget}
        to={`/ui/project/${storageVolume.project}/storage/pool/${newTarget}`}
      />
    );
    toastNotify.success(
      <>
        Volume {volume} successfully moved to pool {pool}
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
      `Move failed for volume ${volumeName} to pool ${targetPool}`,
      e,
      <ResourceLink
        type="volume"
        value={volumeName}
        to={`/ui/project/${project}/storage/pool/${storageVolume.pool}/volumes/${storageVolume.type}/${volumeName}`}
      />,
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
      queryKey: [queryKeys.storage, storageVolume.name],
    });
    setVolumeLoading(false);
  };

  const handleMove = (targetPool: string) => {
    setVolumeLoading(true);
    moveStorageVolume(storageVolume, targetPool, storageVolume.project)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            handleSuccess(targetPool, storageVolume);
          },
          (err) => {
            handleFailure(err, storageVolume.name, targetPool);
          },
          handleFinish,
        );
        const volume = (
          <ResourceLabel bold type="volume" value={storageVolume.name} />
        );
        const pool = (
          <ResourceLink
            type="pool"
            value={targetPool}
            to={`/ui/project/${storageVolume.project}/storage/pool/${targetPool}`}
          />
        );
        toastNotify.info(
          <>
            Move started for volume {volume} to pool {pool}
          </>,
        );
        queryClient.invalidateQueries({
          queryKey: [queryKeys.storage, storageVolume.name, project],
        });
      })
      .catch((e) => {
        notifyFailure(e, storageVolume.name, targetPool);
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
          <MoveVolumeModal
            close={handleClose}
            move={handleMove}
            storageVolume={storageVolume}
          />
        </Portal>
      )}
      <ActionButton
        onClick={openPortal}
        type="button"
        className={classname}
        loading={isVolumeLoading}
        disabled={!canEditVolume(storageVolume) || isVolumeLoading}
        title={
          canEditVolume(storageVolume)
            ? "Move volume"
            : "You do not have permission to move this volume"
        }
      >
        <Icon name="machines" />
        <span>Move</span>
      </ActionButton>
    </>
  );
};

export default MoveVolumeBtn;
