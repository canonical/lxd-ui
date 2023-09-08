import React, { FC } from "react";
import {
  Button,
  Icon,
  Input,
  Label,
  Select,
  Tooltip,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";
import { LxdNicDevice } from "types/device";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { fetchProfiles } from "api/profiles";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { getConfigurationRowBase } from "pages/instances/forms/ConfigurationRow";
import Loader from "components/Loader";
import { figureInheritedNetworks } from "util/instanceConfigInheritance";
import { CustomNetworkDevice } from "util/formDevices";

interface Props {
  formik: SharedFormikTypes;
  project: string;
}

const NetworkForm: FC<Props> = ({ formik, project }) => {
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
    queryKey: [queryKeys.networks],
    queryFn: () => fetchNetworks(project),
  });

  if (profileError) {
    notify.failure("Loading networks failed", networkError);
  }

  if (isProfileLoading || isNetworkLoading) {
    return <Loader />;
  }

  const removeNetwork = (index: number) => {
    const copy = [...formik.values.devices];
    copy.splice(index, 1);
    formik.setFieldValue("devices", copy);
  };

  const addNetwork = () => {
    const copy = [...formik.values.devices];
    copy.push({ type: "nic", name: "" });
    formik.setFieldValue("devices", copy);
  };

  const getNetworkOptions = () => {
    const options = networks.map((network) => {
      return {
        label: network.name,
        value: network.name,
      };
    });
    options.unshift({
      label: networks.length === 0 ? "No networks available" : "Select option",
      value: "",
    });
    return options;
  };

  const inheritedNetworks = figureInheritedNetworks(formik.values, profiles);

  const isReadOnly = (formik.values as EditInstanceFormValues).readOnly;

  return (
    <ConfigurationTable
      rows={[
        ...inheritedNetworks.map((item) => {
          return getConfigurationRowBase({
            configuration: (
              <>
                <Tooltip
                  message="This network is inherited from a profile or project.
To change it, edit it in the profile or project it originates from,
or remove the originating item"
                  position="btm-left"
                >
                  <Icon name="information" />
                </Tooltip>{" "}
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
            override: "",
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
              <Label forId={`networkDevice${index}`}>
                <b>
                  {isReadOnly || device.type === "custom-nic"
                    ? device.name
                    : "Network"}
                </b>
              </Label>
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
              ) : isReadOnly ? (
                (formik.values.devices[index] as LxdNicDevice).network
              ) : (
                <div className="network-device" key={index}>
                  <div>
                    <Select
                      label="Network device"
                      name={`devices.${index}.network`}
                      id={`networkDevice${index}`}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={
                        (formik.values.devices[index] as LxdNicDevice).network
                      }
                      options={getNetworkOptions()}
                    />
                    <Input
                      label="Network name"
                      name={`devices.${index}.name`}
                      id={`networkName${index}`}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={
                        (formik.values.devices[index] as LxdNicDevice).name
                      }
                      type="text"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <Button
                      className="delete-device"
                      onClick={() => removeNetwork(index)}
                      type="button"
                      appearance="base"
                      aria-label="delete network"
                      hasIcon
                    >
                      <Icon name="delete" />
                    </Button>
                  </div>
                </div>
              ),
          });
        }),

        isReadOnly
          ? {}
          : getConfigurationRowBase({
              configuration: "",
              inherited: "",
              override: (
                <Button onClick={addNetwork} type="button" hasIcon>
                  <Icon name="plus" />
                  <span>Add network</span>
                </Button>
              ),
            }),
      ].filter((row) => Object.values(row).length > 0)}
      emptyStateMsg="No networks defined"
    />
  );
};
export default NetworkForm;
