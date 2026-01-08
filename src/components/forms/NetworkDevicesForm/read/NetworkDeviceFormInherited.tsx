import type { FC } from "react";
import classnames from "classnames";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import type { InheritedNetwork } from "util/configInheritance";
import type { LxdNetwork } from "types/network";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import { isNicDevice, isNoneDevice } from "util/devices";
import { isDeviceModified } from "util/formChangeCount";
import ResourceLink from "components/ResourceLink";
import NetworkDeviceActionButtons from "components/forms/NetworkDevicesForm/read/NetworkDeviceActionButtons";
import ConfigurationTable from "components/ConfigurationTable";
import { getNetworkDeviceRows } from "components/forms/NetworkDevicesForm/read/NetworkDeviceRows";

interface Props {
  formik: InstanceAndProfileFormikProps;
  inheritedNetworkDevices: InheritedNetwork[];
  project: string;
  managedNetworks: LxdNetwork[];
}

const NetworkDeviceFormInherited: FC<Props> = ({
  formik,
  inheritedNetworkDevices,
  project,
  managedNetworks,
}) => {
  if (inheritedNetworkDevices.length === 0) return null;

  const rows = inheritedNetworkDevices.flatMap((device) => {
    const overrideDevice = formik.values.devices.find(
      (t) => t.name === device.key,
    ) as LxdNicDevice | LxdNoneDevice | undefined;

    const isOverridden = overrideDevice !== undefined;
    const isDetached = overrideDevice && isNoneDevice(overrideDevice);
    const hasNicOverride =
      device && overrideDevice && isNicDevice(overrideDevice);

    const effectiveDevice =
      overrideDevice && isNicDevice(overrideDevice)
        ? overrideDevice
        : ({ ...device.network, name: device.key } as LxdNicDevice);

    const deviceModified =
      overrideDevice && isDeviceModified(formik, device.key);
    const initialOverride = formik.initialValues.devices.find(
      (t) => t.name === device.key,
    );
    const hasOverrideBeenRemoved = initialOverride && !overrideDevice;

    return getNetworkDeviceRows({
      project,
      managedNetworks,
      device: effectiveDevice,
      isDetached: !!isDetached,
      hasChanges: deviceModified || hasOverrideBeenRemoved,
      showIpAddresses: formik.values.entityType === "instance",
      sourceProfile: (
        <>
          <ResourceLink
            type="profile"
            value={device.sourceProfile}
            to={`/ui/project/${encodeURIComponent(project)}/profile/${encodeURIComponent(device.sourceProfile)}`}
            className={classnames({ "u-text--line-through": isOverridden })}
          />
          {hasNicOverride && (
            <>
              <br />
              <i className="u-text--muted p-text--small">with local override</i>
            </>
          )}
          {isDetached && (
            <>
              <br />
              <i className="u-text--muted p-text--small">detached</i>
            </>
          )}
        </>
      ),
      actions: (
        <NetworkDeviceActionButtons
          formik={formik}
          device={overrideDevice}
          inheritedDevice={device}
        />
      ),
    });
  });

  return (
    <div className="inherited-devices">
      <h2 className="p-heading--4">Inherited network devices</h2>
      <ConfigurationTable
        className="inherited-network-device-configuration-table"
        rows={rows}
      />
    </div>
  );
};

export default NetworkDeviceFormInherited;
