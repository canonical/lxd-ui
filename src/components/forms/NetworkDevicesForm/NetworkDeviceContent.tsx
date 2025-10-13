import ResourceLink from "components/ResourceLink";
import type { FC } from "react";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import NetworkDeviceAcls from "./NetworkDeviceAcls";
import { isNicDevice } from "util/devices";
import type { LxdNetwork } from "types/network";
import NetworkSelector from "pages/projects/forms/NetworkSelector";
import type { InstanceAndProfileFormikProps } from "../instanceAndProfileFormValues";
import { supportsNicDeviceAcls } from "util/networks";

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
}: Props) => {
  if (!isNicDevice(device)) return null;

  if (readOnly) {
    return (
      <div>
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
      </div>
    );
  }

  return (
    <div>
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
    </div>
  );
};

export default NetworkDeviceContent;
