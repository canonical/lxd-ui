import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import CopyVolumeForm from "../forms/CopyVolumeForm";
import type { LxdStorageVolume } from "types/storage";
import { usePortal } from "@canonical/react-components";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  volume: LxdStorageVolume;
  onClose?: () => void;
  className?: string;
}

const CopyVolumeBtn: FC<Props> = ({ volume, className, onClose }) => {
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
          <CopyVolumeForm close={handleClose} volume={volume} />
        </Portal>
      )}
      <Button
        appearance="default"
        aria-label="Copy volume"
        className={className}
        onClick={openPortal}
        title={
          canCreateStorageVolumes(project)
            ? "Copy volume"
            : "You do not have permission to copy this volume"
        }
        disabled={!canCreateStorageVolumes(project)}
      >
        <Icon name="canvas" />
        <span>Copy</span>
      </Button>
    </>
  );
};

export default CopyVolumeBtn;
