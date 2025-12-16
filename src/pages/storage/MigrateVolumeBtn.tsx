import type { FC } from "react";
import { ActionButton, Icon, usePortal } from "@canonical/react-components";
import type { LxdStorageVolume } from "types/storage";
import MigrateVolumeModal from "./MigrateVolumeModal";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";
import classNames from "classnames";

interface Props {
  volume: LxdStorageVolume;
  classname?: string;
  onClose?: () => void;
}

const MigrateVolumeBtn: FC<Props> = ({ volume, classname, onClose }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canEditVolume } = useStorageVolumeEntitlements();
  const isEmpty = volume.used_by?.length === 0;

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  const getTitle = () => {
    if (!canEditVolume(volume)) {
      return "You do not have permission to migrate this volume";
    }

    if (isEmpty) {
      return "Migrate volume";
    }

    return "Volume is in use";
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <MigrateVolumeModal close={handleClose} volume={volume} />
        </Portal>
      )}
      <ActionButton
        onClick={openPortal}
        type="button"
        className={classNames("u-no-margin--bottom has-icon", classname)}
        disabled={!canEditVolume(volume) || !isEmpty}
        title={getTitle()}
      >
        <Icon name="machines" />
        <span>Migrate</span>
      </ActionButton>
    </>
  );
};

export default MigrateVolumeBtn;
