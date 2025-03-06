import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import DuplicateVolumeForm from "../forms/DuplicateVolumeForm";
import type { LxdStorageVolume } from "types/storage";
import { usePortal } from "@canonical/react-components";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  volume: LxdStorageVolume;
  onClose?: () => void;
  className?: string;
}

const DuplicateVolumeBtn: FC<Props> = ({ volume, className, onClose }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canCreateStorageVolumes } = useProjectEntitlements();
  const { data: project } = useProject(volume.project);

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <DuplicateVolumeForm close={handleClose} volume={volume} />
        </Portal>
      )}
      <Button
        appearance="default"
        aria-label="Duplicate volume"
        className={className}
        onClick={openPortal}
        title={
          canCreateStorageVolumes(project)
            ? "Duplicate volume"
            : "You do not have permission to duplicate this volume"
        }
        disabled={!canCreateStorageVolumes(project)}
      >
        <Icon name="canvas" />
        <span>Duplicate</span>
      </Button>
    </>
  );
};

export default DuplicateVolumeBtn;
