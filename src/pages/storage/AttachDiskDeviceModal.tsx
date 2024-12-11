import { FC, KeyboardEvent, useState } from "react";
import { Modal } from "@canonical/react-components";
import FormLink from "components/FormLink";
import BackLink from "components/BackLink";
import { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import CustomVolumeModal from "./CustomVolumeModal";
import { LxdStorageVolume } from "types/storage";
import { LxdDiskDevice } from "types/device";
import HostPathDeviceModal from "./HostPathDeviceModal";

type DiskDeviceType = "custom volume" | "host path" | "";

interface Props {
  close: () => void;
  onFinish: (device: LxdStorageVolume | LxdDiskDevice) => void;
  formik: InstanceAndProfileFormikProps;
  project: string;
}

const AttachDiskDeviceModal: FC<Props> = ({
  close,
  formik,
  project,
  onFinish,
}) => {
  const [type, setType] = useState<DiskDeviceType>("");

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  const handleGoBack = () => {
    if (type) {
      setType("");
      return;
    }
  };

  const modalTitle = !type ? (
    "Choose disk device type"
  ) : (
    <BackLink
      title={`Attach ${type} device`}
      onClick={handleGoBack}
      linkText={"Choose disk device type"}
    />
  );

  return (
    <>
      {!type && (
        <Modal
          close={close}
          className="migrate-instance-modal"
          title={modalTitle}
          onKeyDown={handleEscKey}
        >
          {!type && (
            <div className="choose-migration-type">
              <FormLink
                icon="add-logical-volume"
                title="Attach custom volume device"
                onClick={() => setType("custom volume")}
              />
              <FormLink
                icon="mount"
                title="Attach host path device"
                onClick={() => setType("host path")}
              />
            </div>
          )}
        </Modal>
      )}

      {type === "custom volume" && (
        <CustomVolumeModal
          formik={formik}
          project={project}
          onFinish={onFinish}
          onCancel={handleGoBack}
          title={modalTitle}
        />
      )}

      {type === "host path" && (
        <HostPathDeviceModal
          formik={formik}
          onFinish={onFinish}
          onCancel={handleGoBack}
          title={modalTitle}
        />
      )}
    </>
  );
};

export default AttachDiskDeviceModal;
