import type { FC } from "react";
import { useProfiles } from "context/useProfiles";
import { getInheritedNetworks } from "util/configInheritance";
import { type FormNetworkDevice } from "util/formDevices";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import NetworkDevicePanel from "components/forms/NetworkDevicesForm/edit/NetworkDevicePanel";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import { getExistingDeviceNames } from "util/devices";
import usePanelParams, { panels } from "util/usePanelParams";

interface Props {
  project: string;
  formik: InstanceAndProfileFormikProps;
  onClose: () => void;
  onSave: () => void;
}

const NetworkDevicePanelContainer: FC<Props> = (props) => {
  const { project, formik, onClose, onSave } = props;
  const { data: profiles = [] } = useProfiles(project);
  const panelParams = usePanelParams();

  const existingDeviceNames = getExistingDeviceNames(formik.values, profiles);
  const inheritedNetworks = getInheritedNetworks(formik.values, profiles);
  const shouldDisplayIpAddresses = formik.values.entityType === "instance";
  const deviceName = panelParams?.deviceName;
  const device = formik.values.devices.find((d) => d.name === deviceName) as
    | LxdNicDevice
    | LxdNoneDevice;

  const inheritedDevice = inheritedNetworks.find((d) => d.key === deviceName);

  const getMode = ():
    | "create"
    | "create-override"
    | "edit-override"
    | "edit-local" => {
    if (panelParams.panel === panels.createNetworkDevice) {
      return "create";
    }
    if (inheritedDevice && !device) {
      return "create-override";
    }
    if (inheritedDevice && device) {
      return "edit-override";
    }
    return "edit-local";
  };

  const mode = getMode();

  if (mode === "create") {
    const networkDeviceNames = formik.values.devices.map((d) => d.name);

    return (
      <NetworkDevicePanel
        mode="create"
        project={project}
        onClose={onClose}
        onSave={(newDevice) => {
          const newDevices = [...formik.values.devices, newDevice];
          formik.setFieldValue("devices", newDevices);
          onSave();
        }}
        existingDeviceNames={existingDeviceNames}
        inheritedNetworks={inheritedNetworks}
        networkDeviceNames={networkDeviceNames}
        shouldDisplayIpAddresses={shouldDisplayIpAddresses}
      />
    );
  }

  const saveHandler = (networkToSave: FormNetworkDevice) => {
    const originalDeviceName = deviceName;
    const { devices } = formik.values;
    const existingDeviceIndex = devices.findIndex(
      (d) => d.name === originalDeviceName,
    );
    let updatedDevices: FormNetworkDevice[];

    if (existingDeviceIndex !== -1) {
      updatedDevices = [...devices] as FormNetworkDevice[];
      updatedDevices[existingDeviceIndex] = networkToSave;
    } else {
      updatedDevices = (devices as FormNetworkDevice[])
        .filter((d) => d.name !== originalDeviceName)
        .concat(networkToSave);
    }

    formik.setFieldValue("devices", updatedDevices);
    onSave();
  };

  return (
    <NetworkDevicePanel
      mode={mode}
      device={device}
      inheritedDevice={inheritedDevice}
      project={project}
      onClose={onClose}
      onSave={saveHandler}
      existingDeviceNames={existingDeviceNames}
      inheritedNetworks={inheritedNetworks}
      shouldDisplayIpAddresses={shouldDisplayIpAddresses}
    />
  );
};

export default NetworkDevicePanelContainer;
