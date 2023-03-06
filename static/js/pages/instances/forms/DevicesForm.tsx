import React, { FC, Fragment, ReactNode } from "react";
import {
  Button,
  Col,
  Icon,
  Input,
  Link,
  Row,
  Select,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";
import { fetchStorages } from "api/storages";
import { LxdDiskDevice, LxdNicDevice } from "types/device";
import classnames from "classnames";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";

interface EmptyDevice {
  type: "";
  name: string;
}

type FormDevice =
  | (Partial<LxdDiskDevice> & Required<Pick<LxdDiskDevice, "name">>)
  | (Partial<LxdNicDevice> & Required<Pick<LxdNicDevice, "name">>)
  | EmptyDevice;

export interface DevicesFormValues {
  devices: FormDevice[];
}

export const devicePayload = (values: SharedFormTypes) => {
  return {
    devices: values.devices
      .filter((item) => item.type !== "")
      .reduce((obj, { name, ...item }) => {
        return {
          ...obj,
          [name]: item,
        };
      }, {}),
  };
};

interface Props {
  formik: SharedFormikTypes;
  project: string;
  children?: ReactNode;
}

const DevicesForm: FC<Props> = ({ formik, project, children }) => {
  const removeDiskRow = (index: number) => {
    const copy = [...formik.values.devices];
    copy.splice(index, 1);
    formik.setFieldValue("devices", copy);
  };

  const addDeviceRow = () => {
    const copy = [...formik.values.devices];
    copy.push({ type: "", name: "" });
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

  const { data: storagePools = [] } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStorages(project),
  });

  const getStoragePoolOptions = () => {
    const options = storagePools.map((storagePool) => {
      return {
        label: storagePool.name,
        value: storagePool.name,
      };
    });
    options.unshift({
      label:
        storagePools.length === 0
          ? "No storage pool available"
          : "Select option",
      value: "",
    });
    return options;
  };

  return (
    <div className="device-form">
      {children}
      {formik.values.devices.map((variable, index) => (
        <Fragment key={index}>
          <Row>
            <Col size={8}>
              <Select
                label="Device type"
                name={`devices.${index}.type`}
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  const getValue = () => {
                    switch (e.target.value) {
                      case "disk":
                        return {
                          type: "disk",
                          name: "root",
                          path: "/",
                        };
                      case "nic": {
                        return {
                          type: "nic",
                          name: "",
                        };
                      }
                    }
                  };
                  formik.setFieldValue(`devices.${index}`, getValue());
                }}
                value={formik.values.devices[index].type}
                options={[
                  {
                    label: "Select type",
                    value: "",
                  },
                  {
                    label: "Network",
                    value: "nic",
                  },
                  {
                    label: "Storage",
                    value: "disk",
                  },
                ]}
                aria-label="Device type"
              />
              {formik.values.devices[index].type === "nic" && (
                <>
                  <Select
                    label="Network device"
                    name={`devices.${index}.network`}
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
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={(formik.values.devices[index] as LxdNicDevice).name}
                    type="text"
                    placeholder="Enter name"
                  />
                </>
              )}
              {formik.values.devices[index].type === "disk" && (
                <>
                  <Select
                    label="Storage pool"
                    name={`devices.${index}.pool`}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={(formik.values.devices[index] as LxdDiskDevice).pool}
                    options={getStoragePoolOptions()}
                  />
                  <Input
                    label="Size limit in GB"
                    name={`devices.${index}.size`}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={(formik.values.devices[index] as LxdDiskDevice).size}
                    type="text"
                    placeholder="Enter number with GB suffix"
                  />
                </>
              )}
            </Col>
            <Col size={4}>
              <Button
                className={classnames("delete-device", {
                  "u-hide": formik.values.devices[index].type === "",
                })}
                onClick={() => removeDiskRow(index)}
                type="button"
                appearance="link"
              >
                Delete device
              </Button>
            </Col>
          </Row>
          <hr />
        </Fragment>
      ))}
      <Button onClick={addDeviceRow} type="button" hasIcon>
        <Icon name="plus" />
        <span>Add device</span>
      </Button>
      <Link
        href="https://linuxcontainers.org/lxd/docs/latest/reference/devices/"
        target="_blank"
        rel="noreferrer"
      >
        What is a device{" "}
        <i className="p-icon--external-link external-link-icon"></i>
      </Link>
    </div>
  );
};

export default DevicesForm;
