import React, { FC, Fragment, ReactNode } from "react";
import {
  Button,
  Col,
  Icon,
  Input,
  Row,
  Select,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";
import { LxdNicDevice } from "types/device";
import classnames from "classnames";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import { isEmptyDevice } from "util/formDevices";

interface Props {
  formik: SharedFormikTypes;
  project: string;
  children?: ReactNode;
}

const NetworkForm: FC<Props> = ({ formik, project, children }) => {
  const removeDevice = (index: number) => {
    const copy = [...formik.values.devices];
    copy.splice(index, 1);
    formik.setFieldValue("devices", copy);
  };

  const addDevice = () => {
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

  return (
    <div className="device-form">
      {children}
      {formik.values.devices.map(
        (formDevice, index) =>
          formik.values.devices[index].type === "nic" && (
            <Fragment key={index}>
              <Row>
                <Col size={8}>
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
                    value={(formik.values.devices[index] as LxdNicDevice).name}
                    type="text"
                    placeholder="Enter name"
                  />
                </Col>
                <Col size={4}>
                  <Button
                    className={classnames("delete-device", {
                      "u-hide": isEmptyDevice(formik.values.devices[index]),
                    })}
                    onClick={() => removeDevice(index)}
                    type="button"
                    appearance="link"
                  >
                    Delete
                  </Button>
                </Col>
              </Row>
              <hr />
            </Fragment>
          )
      )}
      <Button onClick={addDevice} type="button" hasIcon>
        <Icon name="plus" />
        <span>Add network</span>
      </Button>
    </div>
  );
};

export default NetworkForm;
