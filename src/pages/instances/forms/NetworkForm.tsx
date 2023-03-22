import React, { FC } from "react";
import {
  Button,
  Icon,
  Input,
  Label,
  Select,
  Tooltip,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";
import { LxdNicDevice } from "types/device";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import OverrideTable from "pages/instances/forms/OverrideTable";
import {
  collapsedViewMaxWidth,
  figureInheritedNetworks,
} from "util/formFields";
import { fetchProfiles } from "api/profiles";
import useMediaQuery from "context/mediaQuery";

interface Props {
  formik: SharedFormikTypes;
  project: string;
}

const NetworkForm: FC<Props> = ({ formik, project }) => {
  const isCollapsedView = useMediaQuery(
    `(max-width: ${collapsedViewMaxWidth}px)`
  );

  const { data: profiles = [] } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: () => fetchProfiles(project),
  });

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

  const { data: networks = [] } = useQuery({
    queryKey: [queryKeys.networks],
    queryFn: () => fetchNetworks(project),
  });

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

  return (
    <OverrideTable
      rows={[
        ...inheritedNetworks.map((item) => {
          const displayLabel = (
            <div>
              <b>{item.key}</b>
            </div>
          );
          const displayValue = item.network?.network;
          return {
            columns: [
              {
                content: (
                  <Tooltip message="This network is inherited from a profile or project. To change it, edit it in the profile or project it originates from, or remove the originating item">
                    <Icon name="warning-grey" />
                  </Tooltip>
                ),
              },
              {
                content: isCollapsedView ? (
                  <>
                    {displayLabel}
                    {displayValue}
                  </>
                ) : (
                  displayLabel
                ),
              },
              {
                content: displayValue,
                className: "value",
              },
              {
                content: item.source,
              },
            ],
          };
        }),
        ...formik.values.devices
          .map((formDevice, index) => {
            if (formDevice.type !== "nic") {
              return {};
            }
            return {
              columns: [
                {
                  content: "",
                },
                {
                  content: (
                    <Label forId={`networkDevice${index}`}>
                      <b>Network</b>
                    </Label>
                  ),
                  className: "value",
                },
                {
                  content: (
                    <div className="network-device" key={index}>
                      <div>
                        <Select
                          label="Network device"
                          name={`devices.${index}.network`}
                          id={`networkDevice${index}`}
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={
                            (formik.values.devices[index] as LxdNicDevice)
                              .network
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
                },
                {
                  content: `Current ${formik.values.type}`,
                },
              ],
            };
          })
          .filter((item) => Object.values(item).length > 0),
        {
          columns: [
            {
              content: "",
            },
            {
              content: "",
              className: "value",
            },
            {
              content: (
                <Button onClick={addNetwork} type="button" hasIcon>
                  <Icon name="plus" />
                  <span>Add network</span>
                </Button>
              ),
            },
            {
              content: "",
            },
          ],
        },
      ]}
    />
  );
};
export default NetworkForm;
