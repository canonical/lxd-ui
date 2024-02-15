import { FC } from "react";
import usePortal from "react-useportal";
import { Button } from "@canonical/react-components";
import VolumeConfigureSnapshotModal from "./VolumeConfigureSnapshotModal";
import { LxdStorageVolume } from "types/storage";

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
