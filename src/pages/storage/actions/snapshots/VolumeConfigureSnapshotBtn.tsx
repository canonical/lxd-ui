import type { FC } from "react";
import { usePortal } from "@canonical/react-components";
import { Button } from "@canonical/react-components";
import VolumeConfigureSnapshotModal from "./VolumeConfigureSnapshotModal";
import type { LxdStorageVolume } from "types/storage";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";

interface Props {
  volume: LxdStorageVolume;
  isDisabled?: boolean;
  className?: string;
}

const VolumeConfigureSnapshotBtn: FC<Props> = ({
  volume,
  isDisabled,
  className,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canEditVolume } = useStorageVolumeEntitlements();

  return (
    <>
      {isOpen && (
        <Portal>
          <div className="snapshot-list">
            <VolumeConfigureSnapshotModal close={closePortal} volume={volume} />
          </div>
        </Portal>
      )}
      <Button
        onClick={openPortal}
        className={className}
        disabled={!canEditVolume(volume) || isDisabled}
        title={
          !canEditVolume(volume)
            ? "You do not have permission to configure this volume"
            : "Configure snapshot"
        }
      >
        See configuration
      </Button>
    </>
  );
};

export default VolumeConfigureSnapshotBtn;
