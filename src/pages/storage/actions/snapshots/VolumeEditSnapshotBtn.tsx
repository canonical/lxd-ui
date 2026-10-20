import type { FC } from "react";
import { Button, usePortal } from "@canonical/react-components";
import type { LxdStorageVolume, LxdVolumeSnapshot } from "types/storage";
import EditVolumeSnapshotForm from "pages/storage/forms/EditVolumeSnapshotForm";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";
import DsIcon from "components/DsIcon";

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
          canManageStorageVolumeSnapshots(volume)
            ? "Edit"
            : "You do not have permission to edit this snapshot"
        }
      >
        <DsIcon icon="edit" />
      </Button>
    </>
  );
};

export default VolumeEditSnapshotBtn;
