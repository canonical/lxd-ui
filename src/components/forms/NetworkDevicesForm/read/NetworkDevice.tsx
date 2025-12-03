import { type FC } from "react";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import type { LxdNetwork } from "types/network";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import NetworkDeviceActionButtons from "components/forms/NetworkDevicesForm/read/NetworkDeviceActionButtons";
import NetworkDeviceContent from "components/forms/NetworkDevicesForm/read/NetworkDeviceContent";
import { getIndex } from "util/devices";
import type { InheritedNetwork } from "util/configInheritance";

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
  const index = getIndex(device?.name || "", formik);

  return (
    <div className="network-device" key={index}>
      <div className="network-device-content">
        {device && (
          <NetworkDeviceContent
            project={project}
            device={device}
            formik={formik}
            network={network}
          />
        )}
      </div>
      <NetworkDeviceActionButtons
        formik={formik}
        device={device}
        inheritedDevice={inheritedDevice}
      />
    </div>
  );
};

export default NetworkDevice;
