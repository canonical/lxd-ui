import type { FC, KeyboardEvent } from "react";
import { useState } from "react";
import { Modal } from "@canonical/react-components";
import FormLink from "components/FormLink";
import BackLink from "components/BackLink";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import CustomVolumeModal from "./CustomVolumeModal";
import type { LxdDiskDevice } from "types/device";
import HostPathDeviceModal from "./HostPathDeviceModal";
import type { LxdStorageVolume } from "types/storage";
import type { RemoteImage } from "types/image";
import { remoteImageToIsoDevice } from "util/formDevices";
import CustomIsoModal from "pages/images/CustomIsoModal";
import { isIsoDiskDevice } from "util/devices";
import type { CustomDiskDevice } from "types/formDevice";

type DiskDeviceType = "custom volume" | "host path" | "choose type" | "iso";

interface Props {
  close: () => void;
  onFinish: (device: CustomDiskDevice) => void;
  formik: InstanceAndProfileFormikProps;
  project: string;
}

const AttachDiskDeviceModal: FC<Props> = ({
  close,
  formik,
  project,
  onFinish,
}) => {
  const [type, setType] = useState<DiskDeviceType>("choose type");

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  const handleGoBack = () => {
    setType("choose type");
  };

  const handleSelectVolume = (volume: LxdStorageVolume) => {
    const device: LxdDiskDevice = {
      type: "disk",
      pool: volume.pool,
      source: volume.name,
      path: volume.content_type === "filesystem" ? "" : undefined,
    };

    onFinish(device);
  };

  const handleSelectIso = (image: RemoteImage) => {
    const isoDevice = remoteImageToIsoDevice(image);
    onFinish(isoDevice);
  };

  const CHOOSE_DISK_TYPE_TITLE = "Choose disk type";
  const getModalTitle = () => {
    switch (type) {
      case "custom volume":
        return (
          <BackLink
            title="Attach custom volume"
            onClick={handleGoBack}
            linkText={CHOOSE_DISK_TYPE_TITLE}
          />
        );
      case "host path":
        return (
          <BackLink
            title="Mount host path"
            onClick={handleGoBack}
            linkText={CHOOSE_DISK_TYPE_TITLE}
          />
        );
      default:
        return CHOOSE_DISK_TYPE_TITLE;
    }
  };

  const modalTitle = getModalTitle();

  const hasIsoDeviceAttached = formik.values.devices.some(isIsoDiskDevice);

  const canAttachIso =
    formik.values.entityType === "profile" ||
    (formik.values.entityType === "instance" &&
      formik.values.instanceType === "virtual-machine");

  return (
    <>
      {type === "choose type" && (
        <Modal
          close={close}
          className="migrate-instance-modal"
          title={modalTitle}
          onKeyDown={handleEscKey}
        >
          <div className="choose-migration-type">
            <FormLink
              icon="add-logical-volume"
              title="Attach custom volume"
              onClick={() => {
                setType("custom volume");
              }}
            />
            <FormLink
              icon="mount"
              title="Mount host path"
              onClick={() => {
                setType("host path");
              }}
            />
            {canAttachIso && (
              <FormLink
                icon="iso"
                title="Attach ISO"
                onClick={() => {
                  setType("iso");
                }}
                disabled={hasIsoDeviceAttached}
                onHoverText={
                  hasIsoDeviceAttached
                    ? "Only one ISO volume can be attached at a time"
                    : undefined
                }
              />
            )}
          </div>
        </Modal>
      )}

      {type === "custom volume" && (
        <CustomVolumeModal
          formik={formik}
          project={project}
          onFinish={handleSelectVolume}
          onCancel={handleGoBack}
          onClose={close}
          title={modalTitle}
        />
      )}

      {type === "host path" && (
        <HostPathDeviceModal
          formik={formik}
          onFinish={onFinish}
          onCancel={handleGoBack}
          onClose={close}
          title={modalTitle}
        />
      )}
      {type === "iso" && (
        <CustomIsoModal
          onClose={close}
          onSelect={handleSelectIso}
          onCancel={handleGoBack}
          cancelButtonText="Back"
          backLinkText={CHOOSE_DISK_TYPE_TITLE}
        />
      )}
    </>
  );
};

export default AttachDiskDeviceModal;
