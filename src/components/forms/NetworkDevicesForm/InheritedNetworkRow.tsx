import ResourceLink from "components/ResourceLink";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import NetworkDeviceAclListRead from "components/forms/NetworkDevicesForm/read/NetworkDeviceAclListRead";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import type { InheritedNetwork } from "util/configInheritance";
import type { LxdNetwork } from "types/network";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import classnames from "classnames";
import NetworkDevice from "components/forms/NetworkDevicesForm/read/NetworkDevice";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import { isNoneDevice } from "util/devices";
import { isDeviceModified } from "util/formChangeCount";
import NetworkDeviceName from "./read/NetworkDeviceName";

interface Props {
  device: InheritedNetwork;
  project: string;
  managedNetworks: LxdNetwork[];
  formik: InstanceAndProfileFormikProps;
}

export const getInheritedNetworkRow = ({
  device,
  project,
  managedNetworks,
  formik,
}: Props): MainTableRow => {
  const overrideDevice = formik.values.devices.find(
    (t) => t.name === device.key,
  ) as LxdNicDevice | LxdNoneDevice | undefined;
  const isOverridden = overrideDevice !== undefined;
  const isDetached = overrideDevice && isNoneDevice(overrideDevice);

  const deviceModified = overrideDevice && isDeviceModified(formik, device.key);
  const initialOverrideDevice = formik.initialValues.devices.find(
    (t) => t.name === device.key,
  );
  const hasOverrideBeenRemoved = initialOverrideDevice && !overrideDevice;
  const hasChanges = deviceModified || hasOverrideBeenRemoved;

  const overrideNetwork = managedNetworks.find(
    (t) => t.name === (overrideDevice as LxdNicDevice)?.network,
  );

  return getConfigurationRowBase({
    configuration: (
      <NetworkDeviceName
        name={device.key}
        hasChanges={hasChanges}
        isDetached={isDetached}
        isInherited
      />
    ),
    inherited: (
      <div>
        <div
          className={classnames("p-text--small", "u-text--muted", {
            "u-text--line-through": isOverridden,
          })}
        >
          From profile{" "}
          <ResourceLink
            type="profile"
            value={device.sourceProfile}
            to={`/ui/project/${encodeURIComponent(project)}/profile/${encodeURIComponent(device.sourceProfile)}`}
            className={classnames({
              "u-text--line-through": isOverridden,
            })}
          />
        </div>
        <div
          className={classnames({
            "u-text--muted": isOverridden,
            "u-text--line-through": isOverridden,
          })}
        >
          Network
        </div>
        <ResourceLink
          type="network"
          value={device.network?.network || ""}
          to={`/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(device.network?.network || "")}`}
          className={classnames({
            "u-text--line-through": isOverridden,
          })}
        />
        <NetworkDeviceAclListRead
          project={project}
          network={managedNetworks.find(
            (t) => t.name === device.network?.network,
          )}
          device={device.network}
          isOverridden={isOverridden}
        />
      </div>
    ),
    override: (
      <NetworkDevice
        formik={formik}
        project={project}
        device={overrideDevice}
        network={overrideNetwork}
        inheritedDevice={device}
      />
    ),
  });
};
