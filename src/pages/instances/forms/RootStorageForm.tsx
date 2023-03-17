import React, { FC, ReactNode } from "react";
import { Col, Input, Row, Select } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStorages } from "api/storages";
import { LxdDiskDevice } from "types/device";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import OverrideField from "pages/instances/forms/OverrideField";

interface Props {
  formik: SharedFormikTypes;
  project: string;
  children?: ReactNode;
}

const RootStorageForm: FC<Props> = ({ formik, project, children }) => {
  const { data: storagePools = [] } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStorages(project),
  });

  const index = formik.values.devices.findIndex(
    (item) => item.type === "disk" && item.name === "root"
  );
  const hasRootStorage = index !== -1;

  const addRootStorage = () => {
    const copy = [...formik.values.devices];
    copy.push({
      type: "disk",
      name: "root",
      path: "/",
    });
    formik.setFieldValue("devices", copy);
  };

  const removeRootStorage = () => {
    const copy = [...formik.values.devices];
    copy.splice(index, 1);
    formik.setFieldValue("devices", copy);
  };

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

  const figureSizeValue = () => {
    if (!hasRootStorage) {
      return "";
    }
    const size = (formik.values.devices[index] as LxdDiskDevice).size;
    return size ? parseInt(size) : "";
  };

  return (
    <div className="device-form">
      {children}
      <Row>
        <Col size={8}>
          <OverrideField
            formik={formik}
            label="Root storage pool"
            name="rootStorage"
            onOverride={addRootStorage}
            onReset={removeRootStorage}
            isSet={hasRootStorage}
          >
            {hasRootStorage && (
              <div>
                <Select
                  id="rootStoragePool"
                  label="Root storage pool"
                  name={`devices.${index}.pool`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={(formik.values.devices[index] as LxdDiskDevice).pool}
                  options={getStoragePoolOptions()}
                />
                <Input
                  id="sizeLimit"
                  label="Size limit in GB"
                  onBlur={formik.handleBlur}
                  onChange={(e) => {
                    formik.setFieldValue(
                      `devices.${index}.size`,
                      e.target.value + "GB"
                    );
                  }}
                  value={figureSizeValue()}
                  type="number"
                  placeholder="Enter number"
                />
              </div>
            )}
          </OverrideField>
        </Col>
      </Row>
    </div>
  );
};

export default RootStorageForm;
