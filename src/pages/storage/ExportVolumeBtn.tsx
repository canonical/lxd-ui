import type { FC } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import classNames from "classnames";
import type { LxdStorageVolume } from "types/storage";
import ExportVolumeModal from "./forms/ExportVolumeModal";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";
import { useCurrentProject } from "context/useCurrentProject";
import { isBackupDisabled } from "util/snapshots";

interface Props {
  volume: LxdStorageVolume;
  classname?: string;
  onClose?: () => void;
}

const ExportVolumeBtn: FC<Props> = ({ volume, classname, onClose }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canManageVolumeBackups } = useStorageVolumeEntitlements();
  const { project } = useCurrentProject();
  const backupDisabled = isBackupDisabled(project);

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  const getTitle = () => {
    if (!canManageVolumeBackups(volume)) {
      return "You do not have permission to export this volume.";
    }

    if (backupDisabled) {
      return `Project "${project?.name}" doesn't allow for backup creation.`;
    }

    return "Export volume";
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
        title={getTitle()}
        disabled={!canManageVolumeBackups(volume) || backupDisabled}
      >
        <Icon name="export" />
        <span>Export</span>
      </Button>
    </>
  );
};

export default ExportVolumeBtn;
