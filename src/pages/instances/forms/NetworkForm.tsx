import React, { FC } from "react";
import {
  Button,
  Col,
  Icon,
  Input,
  Label,
  Row,
  Select,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";
import { LxdNicDevice } from "types/device";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import OverrideTable from "pages/instances/forms/OverrideTable";
import { figureInheritedNetworks } from "util/formFields";
import { fetchProfiles } from "api/profiles";

interface Props {
  formik: SharedFormikTypes;
  project: string;
}

const NetworkForm: FC<Props> = ({ formik, project }) => {
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
          return {
            columns: [
              {
                content: "",
              },
              {
                content: item.key,
              },
              {
                content: item.network?.network,
              },
              {
                content: item.source,
              },
            ],
          };
        }),
        ...formik.values.devices
          .filter((item) => item.type === "nic")
          .map((formDevice, index) => {
            return {
              columns: [
                {
                  content: "",
                },
                {
                  content: (
                    <Label forId={`networkDevice${index}`}>Network</Label>
                  ),
                },
                {
                  content: (
                    <Row key={index}>
                      <Col size={8}>
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
                      </Col>
                      <Col size={4}>
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
                      </Col>
                    </Row>
                  ),
                },
                {
                  content: "",
                },
              ],
            };
          }),
        {
          columns: [
            {
              content: "",
            },
            {
              content: "",
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
