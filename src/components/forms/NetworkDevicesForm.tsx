import { FC } from "react";
import {
  Button,
  Icon,
  Input,
  Select,
  Tooltip,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";
import { LxdNicDevice } from "types/device";
import { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { fetchProfiles } from "api/profiles";
import { EditInstanceFormValues } from "pages/instances/EditInstance";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import Loader from "components/Loader";
import { getInheritedNetworks } from "util/configInheritance";
import { CustomNetworkDevice, deduplicateName } from "util/formDevices";
import { isNicDeviceNameMissing } from "util/instanceValidation";
import { ensureEditMode } from "util/instanceEdit";
import { getExistingDeviceNames } from "util/devices";
import { focusField } from "util/formFields";

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
  } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: () => fetchProfiles(project),
  });

  if (profileError) {
    notify.failure("Loading profiles failed", profileError);
  }

  const {
    data: networks = [],
    isLoading: isNetworkLoading,
    error: networkError,
  } = useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.networks],
    queryFn: () => fetchNetworks(project),
  });

  if (networkError) {
    notify.failure("Loading networks failed", networkError);
  }

  if (isProfileLoading || isNetworkLoading) {
    return <Loader />;
  }

  const managedNetworks = networks.filter((network) => network.managed);

  const focusNetwork = (id: number) => {
    focusField(`devices.${id}.name`);
  };

  const removeNetwork = (index: number) => {
    const copy = [...formik.values.devices];
    copy.splice(index, 1);
    void formik.setFieldValue("devices", copy);
  };

  const existingDeviceNames = getExistingDeviceNames(formik.values, profiles);

  const addNetwork = () => {
    const copy = [...formik.values.devices];
    copy.push({
      type: "nic",
      name: deduplicateName("eth", 1, existingDeviceNames),
      network: managedNetworks[0]?.name ?? "",
    });
    void formik.setFieldValue("devices", copy);

    focusNetwork(copy.length - 1);
  };

  const getNetworkOptions = () => {
    const options = managedNetworks.map((network) => {
      return {
        label: network.name,
        value: network.name,
        disabled: false,
      };
    });
    options.unshift({
      label: options.length === 0 ? "No networks available" : "Select option",
      value: "",
      disabled: true,
    });
    return options;
  };

  const inheritedNetworks = getInheritedNetworks(formik.values, profiles);

  const readOnly = (formik.values as EditInstanceFormValues).readOnly;

  return (
    <ScrollableConfigurationTable
      className="device-form"
      rows={[
        ...inheritedNetworks.map((item) => {
          return getConfigurationRowBase({
            configuration: (
              <>
                <b>{item.key}</b>
              </>
            ),
            inherited: (
              <div>
                <div className="mono-font">
                  <b>{item.network?.network}</b>
                </div>
                <div className="p-text--small u-text--muted">
                  From: {item.source}
                </div>
              </div>
            ),
            override: (
              <Tooltip
                message="This network is inherited from a profile or project.
To change it, edit it in the profile or project it originates from,
or remove the originating item"
                position="btm-left"
              >
                <Icon name="information" />
              </Tooltip>
            ),
          });
        }),

        ...formik.values.devices.map((formDevice, index) => {
          if (!formDevice.type?.includes("nic")) {
            return {};
          }
          const device = formik.values.devices[index] as
            | LxdNicDevice
            | CustomNetworkDevice;

          return getConfigurationRowBase({
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
                <div className="network-device" key={index}>
                  <div>
                    {readOnly ? (
                      <div>
                        {(formik.values.devices[index] as LxdNicDevice).network}
                      </div>
                    ) : (
                      <Select
                        label="Network"
                        name={`devices.${index}.network`}
                        id={`devices.${index}.network`}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={
                          (formik.values.devices[index] as LxdNicDevice).network
                        }
                        options={getNetworkOptions()}
                      />
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
                        title="Edit network"
                        className="u-no-margin--top"
                        hasIcon
                        dense
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
                      title="Detach network"
                    >
                      <Icon name="disconnect" />
                      <span>Detach</span>
                    </Button>
                  </div>
                </div>
              ),
          });
        }),

        getConfigurationRowBase({
          configuration: "",
          inherited: "",
          override: (
            <Button
              onClick={() => {
                ensureEditMode(formik);
                addNetwork();
              }}
              type="button"
              hasIcon
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
