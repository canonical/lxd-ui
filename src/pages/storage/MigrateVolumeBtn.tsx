import type { FC } from "react";
import { ActionButton, Icon, usePortal } from "@canonical/react-components";
import type { LxdStorageVolume } from "types/storage";
import MigrateVolumeModal from "./MigrateVolumeModal";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";
import classNames from "classnames";

interface Props {
  volume: LxdStorageVolume;
  project: string;
  classname?: string;
  onClose?: () => void;
}

const MigrateVolumeBtn: FC<Props> = ({
  volume,
  classname,
  project,
  onClose,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canEditVolume } = useStorageVolumeEntitlements();

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
            volume={volume}
            project={project}
          />
        </Portal>
      )}
      <ActionButton
        onClick={openPortal}
        type="button"
        className={classNames("u-no-margin--bottom has-icon", classname)}
        disabled={!canEditVolume(volume)}
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
