import ResourceLink from "components/ResourceLink";
import type { FC } from "react";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import type { LxdNetwork } from "types/network";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { NetworkDeviceIPAddressRead } from "components/forms/NetworkDevicesForm/read/NetworkDeviceIPAddressRead";
import NetworkDeviceAclListRead from "components/forms/NetworkDevicesForm/read/NetworkDeviceAclListRead";
import { isNoneDevice } from "util/devices";

interface Props {
  project: string;
  formik: InstanceAndProfileFormikProps;
  device: LxdNicDevice | LxdNoneDevice;
  network?: LxdNetwork;
}

const NetworkDeviceContent: FC<Props> = ({
  project,
  formik,
  device,
  network,
}) => {
  if (isNoneDevice(device)) {
    return (
      <span className="u-text--muted">
        <i>detached</i>
      </span>
    );
  }
  return (
    <>
      <div>Network</div>
      <ResourceLink
        type="network"
        value={device.network}
        to={`/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(device.network)}`}
      />
      <NetworkDeviceAclListRead
        project={project}
        network={network}
        device={device}
      />

      {formik.values.entityType === "instance" && (
        <>
          <NetworkDeviceIPAddressRead
            network={network}
            device={device}
            family="IPv4"
          />

          <NetworkDeviceIPAddressRead
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
