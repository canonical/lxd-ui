import { FC, ReactNode, useRef, useState } from "react";
import { Button, Input, Modal } from "@canonical/react-components";
import { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { LxdDiskDevice } from "types/device";

interface Props {
  formik: InstanceAndProfileFormikProps;
  onFinish: (device: LxdDiskDevice) => void;
  onCancel: () => void;
  title?: ReactNode;
}

const HostPathDeviceModal: FC<Props> = ({
  formik,
  onFinish,
  onCancel,
  title,
}) => {
  const [source, setSource] = useState("");
  const [path, setPath] = useState<string>();
  const touchedRef = useRef({
    source: false,
    path: false,
  });

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
      close={onCancel}
      title={title}
      buttonRow={
        <>
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            appearance=""
            className="u-no-margin--bottom"
            type="button"
            loading={formik.isSubmitting}
            disabled={!source || !path}
            onClick={handleFinish}
          >
            Attach
          </Button>
        </>
      }
    >
      <Input
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
      />
    </Modal>
  );
};

export default HostPathDeviceModal;
