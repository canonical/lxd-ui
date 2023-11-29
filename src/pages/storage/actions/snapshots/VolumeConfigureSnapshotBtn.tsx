import React, { FC, ReactNode } from "react";
import usePortal from "react-useportal";
import { Button } from "@canonical/react-components";
import VolumeConfigureSnapshotModal from "./VolumeConfigureSnapshotModal";
import { LxdStorageVolume } from "types/storage";

interface Props {
  volume: LxdStorageVolume;
  onSuccess: (message: string) => void;
  onFailure: (title: string, e: unknown, message?: ReactNode) => void;
  isDisabled?: boolean;
  className?: string;
}

const VolumeConfigureSnapshotBtn: FC<Props> = ({
  volume,
  onSuccess,
  onFailure,
  isDisabled,
  className,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      {isOpen && (
        <Portal>
          <div className="snapshot-list">
            <VolumeConfigureSnapshotModal
              close={closePortal}
              volume={volume}
              onSuccess={onSuccess}
              onFailure={onFailure}
            />
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
