import type { FC, ReactNode } from "react";
import type { ButtonProps } from "@canonical/react-components";
import { Button, usePortal } from "@canonical/react-components";
import CustomVolumeModal from "pages/storage/CustomVolumeModal";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import type { LxdStorageVolume } from "types/storage";

interface Props {
  formik: InstanceAndProfileFormikProps;
  children: ReactNode;
  buttonProps?: ButtonProps;
  project: string;
  setValue: (device: LxdStorageVolume) => void;
}

const CustomVolumeSelectBtn: FC<Props> = ({
  formik,
  children,
  buttonProps,
  project,
  setValue,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const handleFinish = (volume: LxdStorageVolume) => {
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
            formik={formik}
            project={project}
            onFinish={handleFinish}
            onCancel={closePortal}
            onClose={closePortal}
          />
        </Portal>
      )}
    </>
  );
};

export default CustomVolumeSelectBtn;
