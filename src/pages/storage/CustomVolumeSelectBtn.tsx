import React, { FC } from "react";
import { Button, ButtonProps } from "@canonical/react-components";
import { LxdStorageVolumeWithPool } from "context/loadCustomVolumes";
import usePortal from "react-useportal";
import CustomVolumeModal from "pages/storage/CustomVolumeModal";

interface Props {
  children: React.ReactNode;
  buttonProps?: ButtonProps;
  project: string;
  setValue: (volume: LxdStorageVolumeWithPool) => void;
}

const CustomVolumeSelectBtn: FC<Props> = ({
  children,
  buttonProps,
  project,
  setValue,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const handleCancel = () => closePortal();

  const handleFinish = (volume: LxdStorageVolumeWithPool) => {
    setValue(volume);
    closePortal();
  };

  return (
    <>
      <Button onClick={openPortal} type="button" hasIcon {...buttonProps}>
        {children}
      </Button>
      {isOpen && (
        <Portal>
          <CustomVolumeModal
            project={project}
            onFinish={handleFinish}
            onCancel={handleCancel}
          />
        </Portal>
      )}
    </>
  );
};

export default CustomVolumeSelectBtn;
