import { useId, type FC, type ReactNode } from "react";
import type { LxdNicDevice } from "types/device";
import type { LxdNetwork } from "types/network";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import NetworkAclSelector from "pages/networks/forms/NetworkAclSelector";
import { getDeviceAcls, getIndex } from "util/devices";
import { getNetworkAcls } from "util/networks";
import ReadOnlyAclsList from "./ReadOnlyAclsList";

interface Props {
  project: string;
  network?: LxdNetwork;
  device: LxdNicDevice;
  readOnly?: boolean;
  formik?: InstanceAndProfileFormikProps;
  canSelectManualAcls?: boolean;
}

const NetworkDeviceAcls: FC<Props> = ({
  project,
  network,
  device,
  readOnly,
  formik,
  canSelectManualAcls,
}) => {
  if (readOnly) {
    return (
      <ReadOnlyAclsList project={project} network={network} device={device} />
    );
  }

  const id = useId();
  const networkAcls = getNetworkAcls(network);
  const userSelectedAcls = getDeviceAcls(device);

  const selectedAcls = Array.from(
    new Set(networkAcls.concat(userSelectedAcls)),
  );

  const getHelperText = (): ReactNode => {
    if (!canSelectManualAcls) {
      return "Network must be of type OVN to customize ACLs.";
    }
    if (networkAcls.length === 0) return undefined;
    return "Some ACLs are inherited from the network. They cannot be deselected here.";
  };

  return (
    <>
      <label
        className={canSelectManualAcls ? "" : "u-text--muted"}
        htmlFor={id}
      >
        ACLs
      </label>
      {formik && (
        <NetworkAclSelector
          project={project}
          selectedAcls={selectedAcls}
          setSelectedAcls={(selectedItems) => {
            formik.setFieldValue(
              `devices.${getIndex(device.name || "", formik)}["security.acls"]`,
              selectedItems.join(","),
            );
          }}
          id={id}
          inheritedAcls={networkAcls}
          canSelectManualAcls={canSelectManualAcls}
          help={getHelperText()}
        />
      )}
    </>
  );
};

export default NetworkDeviceAcls;
