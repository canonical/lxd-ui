import { useEffect, useState, type FC } from "react";
import type { LxdNicDevice } from "types/device";
import type { LxdNetwork } from "types/network";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import type { CustomNetworkDevice } from "util/formDevices";
import NetworkSelector from "pages/projects/forms/NetworkSelector";
import { Button, Icon } from "@canonical/react-components";
import { ensureEditMode } from "util/instanceEdit";
import Acls from "components/forms/NetworkDevicesForm/Acls";

interface Props {
  index: number;
  readOnly: boolean;
  project: string;
  formik: InstanceAndProfileFormikProps;
  focusNetwork: (id: number) => void;
  removeNetwork: (id: number) => void;
  managedNetworks: LxdNetwork[];
  device: LxdNicDevice | CustomNetworkDevice;
}

const NetworkDevice: FC<Props> = ({
  index,
  readOnly,
  project,
  formik,
  focusNetwork,
  removeNetwork,
  managedNetworks,
  device,
}) => {
  const shouldDisplayAcls = () => {
    const selectedNetwork = (formik.values.devices[index] as LxdNicDevice)
      .network;
    const managedNetwork = managedNetworks.find(
      (t) => t.name === selectedNetwork,
    );
    if (managedNetwork) {
      return managedNetwork.type === "ovn";
    }
    return false;
  };

  const [isAclsDisplayed, setIsAclsDisplayed] =
    useState<boolean>(shouldDisplayAcls());

  useEffect(() => {
    setIsAclsDisplayed(shouldDisplayAcls());
  }, [(formik.values.devices[index] as LxdNicDevice).network]);

  return (
    <div className="network-device" key={index}>
      <div>
        {readOnly ? (
          <div>
            {(formik.values.devices[index] as LxdNicDevice).network}
            <Acls
              project={project}
              managedNetworks={managedNetworks}
              device={device}
              readOnly
            />
          </div>
        ) : (
          <>
            <NetworkSelector
              value={(formik.values.devices[index] as LxdNicDevice).network}
              project={project}
              onBlur={formik.handleBlur}
              setValue={(value) =>
                void formik.setFieldValue(`devices.${index}.network`, value)
              }
              id={`devices.${index}.network`}
              name={`devices.${index}.network`}
            />
            <Acls
              project={project}
              managedNetworks={managedNetworks}
              device={device}
              readOnly={readOnly}
              formik={formik}
              index={index}
              canSelectManualAcls={isAclsDisplayed}
            />
          </>
        )}
      </div>
      <div>
        {readOnly && (
          <Button
            onClick={() => {
              ensureEditMode(formik);
              focusNetwork(index);
            }}
            type="button"
            appearance="base"
            title={formik.values.editRestriction ?? "Edit network"}
            className="u-no-margin--top"
            hasIcon
            dense
            disabled={!!formik.values.editRestriction}
          >
            <Icon name="edit" />
          </Button>
        )}
        <Button
          className="delete-device u-no-margin--top"
          onClick={() => {
            ensureEditMode(formik);
            removeNetwork(index);
          }}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction ?? "Detach network"}
          disabled={!!formik.values.editRestriction}
        >
          <Icon name="disconnect" />
          <span>Detach</span>
        </Button>
      </div>
    </div>
  );
};

export default NetworkDevice;
