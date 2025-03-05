import type { FC } from "react";
import { usePortal } from "@canonical/react-components";
import { Button, Icon } from "@canonical/react-components";
import type { LxdStorageVolume, LxdVolumeSnapshot } from "types/storage";
import EditVolumeSnapshotForm from "pages/storage/forms/EditVolumeSnapshotForm";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";

interface Props {
  volume: LxdStorageVolume;
  snapshot: LxdVolumeSnapshot;
  isDeleting: boolean;
  isRestoring: boolean;
}

const VolumeEditSnapshotBtn: FC<Props> = ({
  volume,
  snapshot,
  isDeleting,
  isRestoring,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canManageStorageVolumeSnapshots } = useStorageVolumeEntitlements();

  return (
    <>
      {isOpen && (
        <Portal>
          <EditVolumeSnapshotForm
            close={closePortal}
            volume={volume}
            snapshot={snapshot}
          />
        </Portal>
      )}
      <Button
        appearance="base"
        hasIcon
        dense={true}
        disabled={
          !canManageStorageVolumeSnapshots(volume) || isDeleting || isRestoring
        }
        onClick={openPortal}
        type="button"
        aria-label="Edit snapshot"
        title={
          !canManageStorageVolumeSnapshots
            ? "You do not have permission to edit this snapshot"
            : "Edit"
        }
      >
        <Icon name="edit" />
      </Button>
    </>
  );
};

export default VolumeEditSnapshotBtn;
