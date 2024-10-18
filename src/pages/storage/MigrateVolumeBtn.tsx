import { FC, useState } from "react";
import { ActionButton, Icon } from "@canonical/react-components";
import usePortal from "react-useportal";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useEventQueue } from "context/eventQueue";
import ItemName from "components/ItemName";
import { useToastNotification } from "context/toastNotificationProvider";
import { LxdStorageVolume } from "types/storage";
import MigrateVolumeModal from "./MigrateVolumeModal";
import { migrateStorageVolume } from "api/storage-pools";
import { useNavigate } from "react-router-dom";

interface Props {
  storageVolume: LxdStorageVolume;
  project: string;
  classname?: string;
  onClose?: () => void;
}

const MigrateVolumeBtn: FC<Props> = ({
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

  const handleSuccess = (
    newTarget: string,
    storageVolume: LxdStorageVolume,
  ) => {
    toastNotify.success(
      <>
        Volume <ItemName item={{ name: storageVolume.name }} bold />{" "}
        successfully migrated to pool{" "}
        <ItemName item={{ name: newTarget }} bold />
      </>,
    );

    const oldVolumeUrl = `/ui/project/${storageVolume.project}/storage/pool/${storageVolume.pool}/volumes/${storageVolume.type}/${storageVolume.name}`;
    const newVolumeUrl = `/ui/project/${storageVolume.project}/storage/pool/${newTarget}/volumes/${storageVolume.type}/${storageVolume.name}`;
    if (window.location.pathname.startsWith(oldVolumeUrl)) {
      navigate(newVolumeUrl);
    }
  };

  const notifyFailure = (
    e: unknown,
    storageVolume: string,
    targetPool: string,
  ) => {
    setVolumeLoading(false);
    toastNotify.failure(
      `Migration failed for volume ${storageVolume} to pool ${targetPool}`,
      e,
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
    void queryClient.invalidateQueries({
      queryKey: [queryKeys.storage, storageVolume.name],
    });
    setVolumeLoading(false);
  };

  const handleMigrate = (targetPool: string) => {
    setVolumeLoading(true);
    migrateStorageVolume(storageVolume, targetPool, storageVolume.project)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => handleSuccess(targetPool, storageVolume),
          (err) => handleFailure(err, storageVolume.name, targetPool),
          handleFinish,
        );
        toastNotify.info(
          `Migration started for volume ${storageVolume.name} to pool ${targetPool}`,
        );
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.storage, storageVolume.name, project],
        });
        handleClose();
      })
      .catch((e) => {
        notifyFailure(e, storageVolume.name, targetPool);
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
            storageVolume={storageVolume}
          />
        </Portal>
      )}
      <ActionButton
        onClick={openPortal}
        type="button"
        className={classname}
        loading={isVolumeLoading}
        disabled={isVolumeLoading}
        title="Migrate volume"
      >
        <Icon name="machines" />
        <span>Migrate</span>
      </ActionButton>
    </>
  );
};

export default MigrateVolumeBtn;
