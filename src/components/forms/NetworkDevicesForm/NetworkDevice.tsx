import { type FC } from "react";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import type { LxdNetwork } from "types/network";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { useNetworks } from "context/useNetworks";
import NetworkDeviceActionButtons from "./NetworkDeviceActionButtons";
import NetworkDeviceContent from "./NetworkDeviceContent";
import { getIndex } from "util/devices";
import type { InheritedNetwork } from "util/configInheritance";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";

interface Props {
  project: string;
  formik: InstanceAndProfileFormikProps;
  device?: LxdNicDevice | LxdNoneDevice;
  network?: LxdNetwork;
  inheritedDevice?: InheritedNetwork;
}

const NetworkDevice: FC<Props> = ({
  project,
  formik,
  device,
  network,
  inheritedDevice,
}) => {
  const readOnly = (formik.values as EditInstanceFormValues).readOnly;
  const { data: networks = [] } = useNetworks(project);
  const managedNetworks = networks.filter((network) => network.managed);
  const index = getIndex(device?.name || "", formik);

  return (
    <div className="network-device" key={index}>
      <div className="network-device-content">
        {device && (
          <NetworkDeviceContent
            readOnly={readOnly}
            project={project}
            device={device}
            formik={formik}
            index={index}
            managedNetworks={managedNetworks}
            network={network}
          />
        )}
      </div>
      <NetworkDeviceActionButtons
        readOnly={readOnly}
        formik={formik}
        index={index}
        device={device}
        inheritedDevice={inheritedDevice}
      />
    </div>
  );
};

export default NetworkDevice;
