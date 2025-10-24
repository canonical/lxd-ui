import type { FC } from "react";
import { useEffect } from "react";
import {
  Button,
  Icon,
  Input,
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
import {
  addNicDevice,
  deduplicateName,
  focusNicDevice,
} from "util/formDevices";
import { isNicDeviceNameMissing } from "util/instanceValidation";
import { ensureEditMode } from "util/instanceEdit";
import { getExistingDeviceNames } from "util/devices";
import { useNetworks } from "context/useNetworks";
import { useProfiles } from "context/useProfiles";
import NetworkDevice from "components/forms/NetworkDevicesForm/NetworkDevice";
import { getInheritedNetworkRow } from "components/forms/NetworkDevicesForm/InheritedNetworkRow";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
}

const NetworkDevicesForm: FC<Props> = ({ formik, project }) => {
  const notify = useNotify();

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

  const existingDeviceNames = getExistingDeviceNames(formik.values, profiles);

  const onAttachNetwork = () => {
    ensureEditMode(formik);
    const index = addNicDevice({
      formik,
      deviceName: deduplicateName("eth", 1, existingDeviceNames),
      deviceNetworkName: managedNetworks[0]?.name ?? "",
    });

    focusNicDevice(index - 1);
  };

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

          return getConfigurationRowBase({
            name: `devices.${index}.name`,
            edit: readOnly ? "read" : "edit",
            configuration: (
              <>
                {readOnly || device.type === "custom-nic" ? (
                  device.name
                ) : (
                  <Input
                    label="Device name"
                    required
                    name={`devices.${index}.name`}
                    id={`devices.${index}.name`}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={(formik.values.devices[index] as LxdNicDevice).name}
                    type="text"
                    placeholder="Enter name"
                    error={
                      isNicDeviceNameMissing(formik, index)
                        ? "Device name is required"
                        : undefined
                    }
                  />
                )}
              </>
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
              onClick={onAttachNetwork}
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
