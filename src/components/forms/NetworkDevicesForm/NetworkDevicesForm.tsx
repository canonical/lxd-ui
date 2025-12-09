import type { FC } from "react";
import { useEffect } from "react";
import {
  Button,
  Icon,
  Tooltip,
  Spinner,
  useNotify,
} from "@canonical/react-components";
import type { LxdNicDevice } from "types/device";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import { getInheritedNetworks } from "util/configInheritance";
import type { CustomNetworkDevice } from "util/formDevices";
import { useNetworks } from "context/useNetworks";
import { useProfiles } from "context/useProfiles";
import NetworkDevice from "components/forms/NetworkDevicesForm/read/NetworkDevice";
import { getInheritedNetworkRow } from "components/forms/NetworkDevicesForm/InheritedNetworkRow";
import usePanelParams from "util/usePanelParams";
import { isDeviceModified } from "util/formChangeCount";
import NetworkDeviceName from "./read/NetworkDeviceName";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
}

const NetworkDevicesForm: FC<Props> = ({ formik, project }) => {
  const notify = useNotify();
  const panelParams = usePanelParams();

  const {
    data: profiles = [],
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfiles(project);

  if (profileError) {
    notify.failure("Loading profiles failed", profileError);
  }

  const {
    data: networks = [],
    isLoading: isNetworkLoading,
    error: networkError,
  } = useNetworks(project);

  useEffect(() => {
    if (networkError) {
      notify.failure("Loading networks failed", networkError);
    }
  }, [networkError]);

  if (isProfileLoading || isNetworkLoading) {
    return <Spinner className="u-loader" text="Loading..." />;
  }

  const managedNetworks = networks.filter((network) => network.managed);

  const inheritedNetworks = getInheritedNetworks(formik.values, profiles);

  const readOnly = (formik.values as EditInstanceFormValues).readOnly;

  return (
    <ScrollableConfigurationTable
      className="device-form"
      rows={[
        ...inheritedNetworks.map((item) =>
          getInheritedNetworkRow({
            device: item,
            project,
            managedNetworks,
            formik,
          }),
        ),

        ...formik.values.devices.map((formDevice, index) => {
          if (
            !formDevice.type?.includes("nic") ||
            inheritedNetworks.map((t) => t.key).includes(formDevice.name)
          ) {
            return {};
          }

          const device = formik.values.devices[index] as
            | LxdNicDevice
            | CustomNetworkDevice;

          const deviceName = device.name || "";
          const hasChanges =
            Boolean(deviceName) && isDeviceModified(formik, deviceName);

          return getConfigurationRowBase({
            name: `devices.${index}.name`,
            edit: readOnly ? "read" : "edit",
            configuration: (
              <NetworkDeviceName name={deviceName} hasChanges={hasChanges} />
            ),
            inherited: "",
            override:
              device.type === "custom-nic" ? (
                <>
                  custom network{" "}
                  <Tooltip message="A custom network can be viewed and edited only from the YAML configuration">
                    <Icon name="information" />
                  </Tooltip>{" "}
                </>
              ) : (
                <NetworkDevice
                  formik={formik}
                  project={project}
                  device={device}
                  network={managedNetworks.find(
                    (t) =>
                      t.name ===
                      (formik.values.devices[index] as LxdNicDevice).network,
                  )}
                />
              ),
          });
        }),

        getConfigurationRowBase({
          configuration: "",
          inherited: "",
          override: (
            <Button
              onClick={panelParams.openCreateNetworkDevice}
              type="button"
              hasIcon
              disabled={!!formik.values.editRestriction}
              title={formik.values.editRestriction}
            >
              <Icon name="plus" />
              <span>Attach network</span>
            </Button>
          ),
        }),
      ].filter((row) => Object.values(row).length > 0)}
      emptyStateMsg="No networks defined"
    />
  );
};
export default NetworkDevicesForm;
