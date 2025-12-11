import type { FC } from "react";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import type { InheritedNetwork } from "util/configInheritance";
import type { LxdNetwork } from "types/network";
import type { LxdNicDevice } from "types/device";
import type { CustomNetworkDevice } from "util/formDevices";
import { isDeviceModified } from "util/formChangeCount";
import NetworkDeviceActionButtons from "components/forms/NetworkDevicesForm/read/NetworkDeviceActionButtons";
import ConfigurationTable from "components/ConfigurationTable";
import { getNetworkDeviceRows } from "components/forms/NetworkDevicesForm/read/NetworkDeviceRows";

interface Props {
  formik: InstanceAndProfileFormikProps;
  inheritedNetworkDevices: InheritedNetwork[];
  project: string;
  managedNetworks: LxdNetwork[];
}

const NetworkDeviceFormCustom: FC<Props> = ({
  formik,
  inheritedNetworkDevices,
  project,
  managedNetworks,
}) => {
  const devices = formik.values.devices.filter((formDevice) => {
    const isNic =
      formDevice.type?.includes("nic") ||
      formDevice.type?.includes("custom-nic");
    const isInherited = inheritedNetworkDevices
      .map((t) => t.key)
      .includes(formDevice.name);
    return isNic && !isInherited;
  });

  if (devices.length === 0) return null;

  const rows = devices.flatMap((device) => {
    const deviceName = device.name || "";
    const typedDevice = device as LxdNicDevice | CustomNetworkDevice;
    const inheritedDevice = inheritedNetworkDevices.find(
      (t) => t.key === deviceName,
    );

    return getNetworkDeviceRows({
      project,
      managedNetworks,
      device: typedDevice,
      hasChanges: isDeviceModified(formik, deviceName),
      showIpAddresses: formik.values.entityType === "instance",
      actions: typedDevice.type?.includes("nic") ? (
        <NetworkDeviceActionButtons
          formik={formik}
          device={typedDevice as LxdNicDevice}
          inheritedDevice={inheritedDevice}
        />
      ) : null,
    });
  });

  return (
    <div className="custom-devices">
      <h2 className="p-heading--4">Custom network devices</h2>
      <ConfigurationTable
        className="custom-network-device-configuration-table"
        rows={rows}
      />
    </div>
  );
};

export default NetworkDeviceFormCustom;
