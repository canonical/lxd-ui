import ResourceLink from "components/ResourceLink";
import type { FC } from "react";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import NetworkDeviceAcls from "./NetworkDeviceAcls";
import type { LxdNetwork } from "types/network";
import NetworkSelector from "pages/projects/forms/NetworkSelector";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { supportsNicDeviceAcls } from "util/networks";
import { isNoneDevice } from "util/devices";
import { NetworkDeviceIPAddress } from "./NetworkDeviceIPAddress";

interface Props {
  readOnly: boolean;
  project: string;
  formik: InstanceAndProfileFormikProps;
  device: LxdNicDevice | LxdNoneDevice;
  index: number;
  managedNetworks: LxdNetwork[];
  network?: LxdNetwork;
}

const NetworkDeviceContent: FC<Props> = ({
  readOnly,
  project,
  formik,
  device,
  index,
  managedNetworks,
  network,
}) => {
  if (isNoneDevice(device)) {
    return (
      <span className="u-text--muted">
        <i>detached</i>
      </span>
    );
  }
  if (readOnly) {
    return (
      <>
        <div>Network</div>
        <ResourceLink
          type="network"
          value={device.network}
          to={`/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(device.network)}`}
        />
        <NetworkDeviceAcls
          project={project}
          network={network}
          device={device}
          readOnly
        />

        {formik.values.entityType === "instance" && (
          <>
            <NetworkDeviceIPAddress
              formik={formik}
              index={index}
              network={network}
              device={device}
              family="IPv4"
            />

            <NetworkDeviceIPAddress
              formik={formik}
              index={index}
              network={network}
              device={device}
              family="IPv6"
            />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <NetworkSelector
        value={device.network}
        setValue={(value) => {
          formik.setFieldValue(`devices.${index}.network`, value);

          const selectedNetwork = managedNetworks.find((t) => t.name === value);

          if (selectedNetwork && !supportsNicDeviceAcls(selectedNetwork)) {
            formik.setFieldValue(
              `devices.${index}["security.acls"]`,
              undefined,
            );
          }
        }}
        id={`devices.${index}.network`}
        name={`devices.${index}.network`}
        managedNetworks={managedNetworks}
      />
      <NetworkDeviceAcls
        project={project}
        network={network}
        device={device}
        readOnly={readOnly}
        formik={formik}
        canSelectManualAcls={supportsNicDeviceAcls(network)}
      />
      {formik.values.entityType === "instance" && (
        <>
          <NetworkDeviceIPAddress
            formik={formik}
            index={index}
            network={network}
            device={device}
            family="IPv4"
          />
          <NetworkDeviceIPAddress
            formik={formik}
            index={index}
            network={network}
            device={device}
            family="IPv6"
          />
        </>
      )}
    </>
  );
};

export default NetworkDeviceContent;
