import React, { FC, ReactNode } from "react";
import {
  Button,
  Col,
  Icon,
  Input,
  Link,
  Row,
  Select,
} from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { FormValues } from "pages/instances/CreateInstanceForm";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";
import { fetchStorages } from "api/storages";
import { LxdDiskDevice, LxdNicDevice } from "types/device";

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

interface Props {
  formik: FormikProps<FormValues>;
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
    <>
      {children}
      {formik.values.devices.map((variable, index) => (
        <Row key={index} className="devices-form-row">
          <Col size={9}>
            <Select
              label="Device type"
              name={`devices.${index}.type`}
              onBlur={formik.handleBlur}
              onChange={(e) => {
                formik.setFieldValue(`devices.${index}`, {
                  type: e.target.value,
                  name: "",
                });
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
                  label: "Storage pool",
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
                  value={(formik.values.devices[index] as LxdNicDevice).network}
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
                  label="Name"
                  name={`devices.${index}.name`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={(formik.values.devices[index] as LxdDiskDevice).name}
                  type="text"
                  placeholder="Enter a name (i.e. root)"
                />
                <Input
                  label="Path"
                  name={`devices.${index}.path`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={(formik.values.devices[index] as LxdDiskDevice).path}
                  type="text"
                  placeholder="Enter path (i.e. /)"
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
            <hr />
          </Col>
          <Col size={3}>
            <Button
              className="delete-device"
              onClick={() => removeDiskRow(index)}
              type="button"
              appearance="link"
            >
              Delete device
            </Button>
          </Col>
        </Row>
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
        What is a device <Icon name="external-link" />
      </Link>
    </>
  );
};

export default DevicesForm;
