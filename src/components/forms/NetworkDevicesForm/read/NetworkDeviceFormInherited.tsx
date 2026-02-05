import type { FC } from "react";
import classnames from "classnames";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import type { InheritedNetwork } from "util/configInheritance";
import type { LxdNetwork } from "types/network";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import { isCustomNic, isNicDevice, isNoneDevice } from "util/devices";
import { isDeviceModified } from "util/formChangeCount";
import NetworkDeviceActionButtons from "components/forms/NetworkDevicesForm/read/NetworkDeviceActionButtons";
import ConfigurationTable from "components/ConfigurationTable";
import { getNetworkDeviceRows } from "components/forms/NetworkDevicesForm/read/NetworkDeviceRows";
import ProfileRichChip from "pages/profiles/ProfileRichChip";
import type { CustomNetworkDevice, FormDevice } from "types/formDevice";
import { isCustomNicFormDevice } from "util/formDevices";

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

  const rows = inheritedNetworkDevices.flatMap((inherited) => {
    const overrideDevice = formik.values.devices.find(
      (t) => t.name === inherited.key,
    ) as LxdNicDevice | LxdNoneDevice | CustomNetworkDevice | undefined;

    const isOverridden = overrideDevice !== undefined;
    const isDetached = overrideDevice && isNoneDevice(overrideDevice);
    const hasNicOverride =
      inherited && overrideDevice && isNicDevice(overrideDevice);
    const hasCustomOverride =
      inherited &&
      overrideDevice &&
      isCustomNicFormDevice(overrideDevice as FormDevice);

    const getEffectiveDevice = () => {
      if (overrideDevice && isNicDevice(overrideDevice)) {
        return overrideDevice;
      }
      if (
        overrideDevice &&
        isCustomNicFormDevice(overrideDevice as FormDevice)
      ) {
        return overrideDevice as CustomNetworkDevice;
      }
      if (inherited.network) {
        if (isCustomNic(inherited.network)) {
          return {
            name: inherited.key,
            type: "custom-nic",
            bare: inherited.network,
          } as CustomNetworkDevice;
        }

        return { ...inherited.network, name: inherited.key } as LxdNicDevice;
      }
      return null;
    };

    const effectiveDevice = getEffectiveDevice();

    const deviceModified =
      overrideDevice && isDeviceModified(formik, inherited.key);
    const initialOverride = formik.initialValues.devices.find(
      (t) => t.name === inherited.key,
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
          <ProfileRichChip
            profileName={inherited.sourceProfile}
            projectName={project}
            className={classnames({
              "u-text--line-through": isOverridden,
            })}
          />
          {(hasNicOverride || hasCustomOverride) && (
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
          inheritedDevice={inherited}
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
