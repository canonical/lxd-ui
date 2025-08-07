import type { FC } from "react";
import type { LxdStorageVolume } from "types/storage";
import { Button, Icon, Tooltip, usePortal } from "@canonical/react-components";
import CreateVolumeSnapshotForm from "pages/storage/forms/CreateVolumeSnapshotForm";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";

interface Props {
  volume: LxdStorageVolume;
  isCTA?: boolean;
  isDisabled?: boolean;
  className?: string;
}

const VolumeAddSnapshotBtn: FC<Props> = ({
  volume,
  isCTA,
  isDisabled,
  className,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canManageStorageVolumeSnapshots } = useStorageVolumeEntitlements();

  const getDisabledReason = () => {
    if (isDisabled) {
      return `Snapshot creation is blocked for project ${volume.project}`;
    }
    if (!canManageStorageVolumeSnapshots(volume)) {
      return "You do not have permission to create snapshots of this volume.";
    }
    return "Add Snapshot";
  };

  return (
    <>
      {isOpen ? (
        <Portal>
          <CreateVolumeSnapshotForm volume={volume} close={closePortal} />
        </Portal>
      ) : null}
      {isCTA ? (
        <Button
          appearance="base"
          hasIcon
          dense={true}
          onClick={openPortal}
          type="button"
          aria-label="Add Snapshot"
          title={getDisabledReason()}
          disabled={isDisabled || !canManageStorageVolumeSnapshots(volume)}
          className={className}
        >
          <Icon name="add-canvas" />
        </Button>
      ) : (
        <Button
          appearance="positive"
          className={className}
          onClick={openPortal}
          disabled={isDisabled || !canManageStorageVolumeSnapshots(volume)}
          title={getDisabledReason()}
        >
          {isDisabled ? (
            <Tooltip
              message={`Snapshot creation has been disabled for volumes in the project ${volume.project}`}
            >
              Create snapshot
            </Tooltip>
          ) : (
            "Create snapshot"
          )}
        </Button>
      )}
    </>
  );
};

export default VolumeAddSnapshotBtn;
