import type { FC, ReactNode } from "react";
import type { ButtonProps } from "@canonical/react-components";
import { Button, usePortal } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import AttachDiskDeviceModal from "./AttachDiskDeviceModal";
import type { CustomDiskDevice } from "types/formDevice";

interface Props {
  formik: InstanceAndProfileFormikProps;
  children: ReactNode;
  buttonProps?: ButtonProps;
  project: string;
  setValue: (device: CustomDiskDevice) => void;
}

const AttachDiskDeviceBtn: FC<Props> = ({
  formik,
  children,
  buttonProps,
  project,
  setValue,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const handleFinish = (device: CustomDiskDevice) => {
    setValue(device);
    closePortal();
  };

  return (
    <>
      <Button
        onClick={openPortal}
        type="button"
        hasIcon
        {...buttonProps}
        disabled={!!formik.values.editRestriction}
        title={formik.values.editRestriction}
      >
        {children}
      </Button>
      {isOpen && (
        <Portal>
          <AttachDiskDeviceModal
            formik={formik}
            project={project}
            onFinish={handleFinish}
            close={closePortal}
          />
        </Portal>
      )}
    </>
  );
};

export default AttachDiskDeviceBtn;
