import type { FC } from "react";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import type { InheritedNetwork } from "util/configInheritance";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import type { LxdNetwork } from "types/network";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import type { LxdNicDevice } from "types/device";
import { isDeviceModified } from "util/formChangeCount";
import NetworkDeviceName from "components/forms/NetworkDevicesForm/read/NetworkDeviceName";
import type { CustomNetworkDevice } from "util/formDevices";
import { Button, Icon, Label, Tooltip } from "@canonical/react-components";
import ConfigurationTable from "components/ConfigurationTable";
import usePanelParams from "util/usePanelParams";
import ResourceLink from "components/ResourceLink";
import ExpandableList from "components/ExpandableList";
import { getDeviceAcls } from "util/devices";
import { getNetworkAcls, combineAcls } from "util/networks";
import NetworkDeviceActionButtons from "components/forms/NetworkDevicesForm/read/NetworkDeviceActionButtons";

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
  const panelParams = usePanelParams();
  const deviceComponents: React.ReactElement[] = [];

  formik.values.devices.forEach((formDevice, index) => {
    if (
      !formDevice.type?.includes("nic") ||
      inheritedNetworkDevices.map((t) => t.key).includes(formDevice.name)
    ) {
      return;
    }

    const device = formik.values.devices[index] as
      | LxdNicDevice
      | CustomNetworkDevice;

    const deviceName = device.name || "";
    const hasChanges =
      Boolean(deviceName) && isDeviceModified(formik, deviceName);

    const deviceRows: MainTableRow[] = [];

    if (device.type === "custom-nic") {
      deviceRows.push(
        getConfigurationRowBase({
          configuration: (
            <>
              custom network{" "}
              <Tooltip message="A custom network can be viewed and edited only from the YAML configuration">
                <Icon name="information" />
              </Tooltip>{" "}
            </>
          ),
          inherited: "",
          override: "",
        }),
      );
    } else {
      deviceRows.push(
        getConfigurationRowBase({
          className: "no-border-top",
          configuration: (
            <Label forId={`devices.${index}.network`}>Network</Label>
          ),
          inherited: (
            <ResourceLink
              type="network"
              value={device.network}
              to={`/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(device.network)}`}
            />
          ),
          override: "",
        }),
      );

      const network = managedNetworks.find((t) => t.name === device.network);
      const networkAcls = getNetworkAcls(network);
      const deviceAcls = getDeviceAcls(device);
      const allAcls = combineAcls(networkAcls, deviceAcls);

      deviceRows.push(
        getConfigurationRowBase({
          className: "no-border-top ",
          configuration: <Label forId={`devices.${index}.network`}>ACLs</Label>,
          inherited:
            allAcls.length > 0 ? (
              <ExpandableList
                items={allAcls.map((acl) => (
                  <ResourceLink
                    key={acl}
                    type="network-acl"
                    value={acl}
                    to={`/ui/project/${encodeURIComponent(project || "default")}/network-acl/${encodeURIComponent(acl)}`}
                  />
                ))}
              />
            ) : (
              "-"
            ),
          override: "",
        }),
      );

      if (formik.values.entityType === "instance") {
        const network = managedNetworks.find(
          (t) =>
            t.name === (formik.values.devices[index] as LxdNicDevice).network,
        );
        const networkIPv4 = network?.config["ipv4.address"];
        const deviceIPv4 = device["ipv4.address"];
        const networkIPv6 = network?.config["ipv6.address"];
        const deviceIPv6 = device["ipv6.address"];

        deviceRows.push(
          getConfigurationRowBase({
            className: "no-border-top",
            configuration: <Label forId={`devices.${index}.ipv4`}>IPv4</Label>,
            inherited: networkIPv4 !== "none" && (
              <b className="mono-font">{deviceIPv4 || "dynamic"}</b>
            ),
            override: "",
          }),
        );

        deviceRows.push(
          getConfigurationRowBase({
            className: "no-border-top",
            configuration: <Label forId={`devices.${index}.ipv6`}>IPv6</Label>,
            inherited: networkIPv6 !== "none" && (
              <b className="mono-font">{deviceIPv6 || "dynamic"}</b>
            ),
            override: "",
          }),
        );
      }
    }

    const inheritedDevice = inheritedNetworkDevices.find(
      (t) => t.key === deviceName,
    );

    deviceComponents.push(
      <div key={deviceName} className="device-section u-sv3">
        <div className="device-section-header u-flex">
          <NetworkDeviceName name={deviceName} hasChanges={hasChanges} />
          {device.type?.includes("nic") && (
            <NetworkDeviceActionButtons
              formik={formik}
              device={device as LxdNicDevice}
              inheritedDevice={inheritedDevice}
            />
          )}
        </div>
        <ConfigurationTable
          className="network-device-form-custom"
          rows={deviceRows}
        />
      </div>,
    );
  });

  return deviceComponents.length > 0 ? (
    <div className="custom-devices">
      <h2 className="p-heading--4 custom-devices-heading">
        Custom network devices
      </h2>
      <div className="custom-devices-container u-sv1">{deviceComponents}</div>
      <Button
        onClick={panelParams.openCreateNetworkDevice}
        type="button"
        hasIcon
        disabled={!!formik.values.editRestriction}
        title={formik.values.editRestriction}
      >
        <Icon name="plus" />
        <span>Attach network</span>
      </Button>
    </div>
  ) : null;
};

export default NetworkDeviceFormCustom;
