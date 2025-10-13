import { type FC } from "react";
import type { LxdNicDevice, LxdNoneDevice } from "types/device";
import type { LxdNetwork } from "types/network";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { useNetworks } from "context/useNetworks";
import { getIndex } from "util/devices";
import NetworkDeviceActionButtons from "./NetworkDeviceActionButtons";
import NetworkDeviceContent from "./NetworkDeviceContent";
import { ensureEditMode } from "util/instanceEdit";

interface Props {
  readOnly: boolean;
  project: string;
  formik: InstanceAndProfileFormikProps;
  focusNetwork: (id: number) => void;
  removeNetwork: (deviceName: string) => void;
  device: LxdNicDevice | LxdNoneDevice;
  network?: LxdNetwork;
  isInheritedRow?: boolean;
}

const NetworkDevice: FC<Props> = ({
  readOnly,
  project,
  formik,
  focusNetwork,
  removeNetwork,
  network,
  device,
  isInheritedRow,
}) => {
  const { data: networks = [] } = useNetworks(project);
  const managedNetworks = networks.filter((network) => network.managed);
  const index = getIndex(device, formik);

  return (
    <div className="network-device" key={index}>
      <NetworkDeviceContent
        readOnly={readOnly}
        project={project}
        device={device}
        formik={formik}
        index={index}
        managedNetworks={managedNetworks}
        network={network}
      />
      <NetworkDeviceActionButtons
        readOnly={readOnly}
        formik={formik}
        onClickEdit={() => {
          ensureEditMode(formik);
          focusNetwork(index);
        }}
        onClickDetach={() => {
          ensureEditMode(formik);
          removeNetwork(device.name || "");
        }}
        detachLabel={isInheritedRow ? "Clear override" : "Detach"}
      />
    </div>
  );
};

export default NetworkDevice;
