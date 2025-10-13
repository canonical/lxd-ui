import ResourceLink from "components/ResourceLink";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import ReadOnlyAclsList from "components/forms/NetworkDevicesForm/ReadOnlyAclsList";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import type { InheritedNetwork } from "util/configInheritance";
import type { LxdNetwork } from "types/network";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import classNames from "classnames";
import NetworkDevice from "./NetworkDevice";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import { ensureEditMode } from "util/instanceEdit";
import NetworkDeviceActionButtons from "./NetworkDeviceActionButtons";
import { addDevice, addNoneDevice } from "util/formDevices";

interface Props {
  device: InheritedNetwork;
  project: string;
  managedNetworks: LxdNetwork[];
  formik: InstanceAndProfileFormikProps;
  focusNetwork: (id: number) => void;
  removeNetwork: (deviceName: string) => void;
  isOverridden: boolean;
}

export const getInheritedNetworkRow = ({
  device,
  project,
  managedNetworks,
  formik,
  focusNetwork,
  removeNetwork,
  isOverridden: isOverridden,
}: Props): MainTableRow => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;
  const overrideDevice = formik.values.devices.find(
    (t) => t.name === device.key,
  ) as LxdNicDevice | LxdNoneDevice;

  const overrideNetwork = managedNetworks.find(
    (t) =>
      t.name ===
      (formik.values.devices.find((t) => t.name === device.key) as LxdNicDevice)
        ?.network,
  );

  return getConfigurationRowBase({
    configuration: (
      <>
        <b>{device.key}</b>
      </>
    ),
    inherited: (
      <div>
        <div
          className={classNames("p-text--small", "u-text--muted", {
            "u-text--line-through": isOverridden,
          })}
        >
          From: {device.source}
        </div>
        <div
          className={classNames({
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
          className={classNames({
            "u-text--muted": isOverridden,
            "u-text--line-through": isOverridden,
          })}
        />
        <ReadOnlyAclsList
          project={project}
          network={managedNetworks.find(
            (t) => t.name === device.network?.network,
          )}
          device={device.network}
        />
      </div>
    ),
    override: isOverridden ? (
      <NetworkDevice
        readOnly={readOnly}
        formik={formik}
        project={project}
        focusNetwork={focusNetwork}
        removeNetwork={removeNetwork}
        device={overrideDevice}
        network={overrideNetwork}
        isInheritedRow
      />
    ) : (
      <NetworkDeviceActionButtons
        readOnly={readOnly}
        formik={formik}
        onClickEdit={() => {
          ensureEditMode(formik);
          addDevice({
            formik,
            deviceName: device.key,
            deviceNetworkName: managedNetworks[0]?.name ?? "",
          });

          focusNetwork(
            formik?.values.devices.findIndex((t) => t.name === device.key),
          );
        }}
        onClickDetach={() => {
          ensureEditMode(formik);
          addNoneDevice(device.key, formik);
          focusNetwork(
            formik?.values.devices.findIndex((t) => t.name === device.key),
          );
        }}
        detachLabel="Detach"
      />
    ),
  });
};
