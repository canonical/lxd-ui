import { type FC } from "react";
import type { LxdNicDevice } from "types/device";
import type { LxdNetwork } from "types/network";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import NetworkSelector from "pages/projects/forms/NetworkSelector";
import { Button, Icon } from "@canonical/react-components";
import { ensureEditMode } from "util/instanceEdit";
import NetworkDeviceAcls from "components/forms/NetworkDevicesForm/NetworkDeviceAcls";
import ResourceLink from "components/ResourceLink";
import { supportsNicDeviceAcls } from "util/networks";
import { useNetworks } from "context/useNetworks";

interface Props {
  index: number;
  readOnly: boolean;
  project: string;
  formik: InstanceAndProfileFormikProps;
  focusNetwork: (id: number) => void;
  removeNetwork: (id: number) => void;
  device: LxdNicDevice;
  network?: LxdNetwork;
}

const NetworkDevice: FC<Props> = ({
  index,
  readOnly,
  project,
  formik,
  focusNetwork,
  removeNetwork,
  network,
  device,
}) => {
  const { data: networks = [] } = useNetworks(project);
  const managedNetworks = networks.filter((network) => network.managed);

  return (
    <div className="network-device" key={index}>
      <div>
        {readOnly ? (
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
        ) : (
          <>
            <NetworkSelector
              value={device.network}
              setValue={(value) => {
                formik.setFieldValue(`devices.${index}.network`, value);

                const selectedNetwork = managedNetworks.find(
                  (t) => t.name === value,
                );

                if (
                  selectedNetwork &&
                  !supportsNicDeviceAcls(selectedNetwork)
                ) {
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
              index={index}
              canSelectManualAcls={supportsNicDeviceAcls(network)}
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
