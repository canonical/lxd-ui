import type { FC } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import classNames from "classnames";
import type { LxdStorageVolume } from "types/storage";
import ExportVolumeModal from "./forms/ExportVolumeModal";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";

interface Props {
  volume: LxdStorageVolume;
  classname?: string;
  onClose?: () => void;
}

const ExportVolumeBtn: FC<Props> = ({ volume, classname, onClose }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canManageVolumeBackups } = useStorageVolumeEntitlements();

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <ExportVolumeModal close={handleClose} volume={volume} />
        </Portal>
      )}
      <Button
        appearance="default"
        className={classNames("u-no-margin--bottom has-icon", classname)}
        onClick={openPortal}
        title={
          canManageVolumeBackups(volume)
            ? "Export volume"
            : "You do not have permission to export this volume."
        }
        disabled={!canManageVolumeBackups(volume)}
      >
        <Icon name="export" />
        <span>Export</span>
      </Button>
    </>
  );
};

export default ExportVolumeBtn;
