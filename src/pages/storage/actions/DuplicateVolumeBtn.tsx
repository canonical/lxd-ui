import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import DuplicateVolumeForm from "../forms/DuplicateVolumeForm";
import type { LxdStorageVolume } from "types/storage";
import { usePortal } from "@canonical/react-components";

interface Props {
  volume: LxdStorageVolume;
  onClose?: () => void;
  className?: string;
}

const DuplicateVolumeBtn: FC<Props> = ({ volume, className, onClose }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

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
        title="Duplicate volume"
      >
        <Icon name="canvas" />
        <span>Duplicate</span>
      </Button>
    </>
  );
};

export default DuplicateVolumeBtn;
