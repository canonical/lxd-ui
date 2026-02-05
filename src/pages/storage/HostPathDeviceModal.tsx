import type { FC, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Button, Input, Modal } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import type { LxdDiskDevice } from "types/device";
import { focusField } from "util/formFields";

interface Props {
  formik: InstanceAndProfileFormikProps;
  onFinish: (device: LxdDiskDevice) => void;
  onCancel: () => void;
  onClose: () => void;
  title?: ReactNode;
}

const HostPathDeviceModal: FC<Props> = ({
  formik,
  onFinish,
  onCancel,
  onClose,
  title,
}) => {
  const [source, setSource] = useState("");
  const [path, setPath] = useState("");
  const touchedRef = useRef({
    source: false,
    path: false,
  });

  useEffect(() => {
    focusField("host-path");
  }, []);

  const handleFinish = () => {
    const device: LxdDiskDevice = {
      type: "disk",
      source,
      path,
    };

    onFinish(device);
  };

  return (
    <Modal
      className="host-path-device-modal"
      close={onClose}
      title={title}
      buttonRow={
        <>
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            type="button"
            onClick={onCancel}
          >
            Back
          </Button>
          <Button
            appearance=""
            className="u-no-margin--bottom"
            type="button"
            loading={formik.isSubmitting}
            disabled={!source || !path || formik.isSubmitting}
            onClick={handleFinish}
          >
            Attach
          </Button>
        </>
      }
    >
      <Input
        id="host-path"
        value={source}
        onChange={(e) => {
          touchedRef.current.source = true;
          setSource(e.target.value);
        }}
        type="text"
        label="Host path"
        required
        error={
          !source && touchedRef.current.source
            ? "Host path is required"
            : undefined
        }
        placeholder="Enter full path (e.g. /home)"
      />
      <Input
        value={path}
        onChange={(e) => {
          touchedRef.current.path = true;
          setPath(e.target.value);
        }}
        type="text"
        label="Mount point"
        required
        error={
          !path && touchedRef.current.path
            ? "Mount point is required"
            : undefined
        }
        placeholder="Enter full path (e.g. /data)"
      />
    </Modal>
  );
};

export default HostPathDeviceModal;
