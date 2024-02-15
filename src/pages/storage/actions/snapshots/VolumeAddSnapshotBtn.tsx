import { FC } from "react";
import { LxdStorageVolume } from "types/storage";
import { Button, Icon, Tooltip } from "@canonical/react-components";
import usePortal from "react-useportal";
import CreateVolumeSnapshotForm from "pages/storage/forms/CreateVolumeSnapshotForm";

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
          title={
            isDisabled
              ? `Snapshot creation is blocked for project ${volume.project}`
              : "Add Snapshot"
          }
          disabled={isDisabled}
          className={className}
        >
          <Icon name="add-canvas" />
        </Button>
      ) : (
        <Button
          appearance="positive"
          className={className}
          onClick={openPortal}
          disabled={isDisabled}
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
