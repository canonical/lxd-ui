import type { FC } from "react";
import { usePortal } from "@canonical/react-components";
import { Button } from "@canonical/react-components";
import VolumeConfigureSnapshotModal from "./VolumeConfigureSnapshotModal";
import type { LxdStorageVolume } from "types/storage";

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

  return (
    <>
      {isOpen && (
        <Portal>
          <div className="snapshot-list">
            <VolumeConfigureSnapshotModal close={closePortal} volume={volume} />
          </div>
        </Portal>
      )}
      <Button onClick={openPortal} className={className} disabled={isDisabled}>
        See configuration
      </Button>
    </>
  );
};

export default VolumeConfigureSnapshotBtn;
