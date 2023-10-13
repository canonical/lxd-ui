import React, { FC, ReactNode } from "react";
import { Row, Input, Select, Col } from "@canonical/react-components";
import { FormikProps } from "formik";
import {
  zfsDriver,
  storageDrivers,
  dirDriver,
  btrfsDriver,
  getSourceHelpForDriver,
} from "util/storageOptions";
import { StoragePoolFormValues } from "./StoragePoolForm";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormMain: FC<Props> = ({ formik }) => {
  const getFormProps = (id: "name" | "description" | "size" | "source") => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id],
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `Enter ${id.replaceAll("_", " ")}`,
    };
  };

  return (
    <Row>
      <Col size={8}>
        <Input {...getFormProps("name")} type="text" label="Name" required />
        <Input
          {...getFormProps("description")}
          type="text"
          label="Description"
        />
        <Select
          id="driver"
          name="driver"
          help={
            formik.values.driver === zfsDriver
              ? "ZFS gives best performance and reliability"
              : undefined
          }
          label="Driver"
          options={storageDrivers}
          onChange={(target) => {
            const val = target.target.value;
            if (val === dirDriver) {
              void formik.setFieldValue("size", "");
            }
            if (val === btrfsDriver) {
              void formik.setFieldValue("source", "");
            }
            void formik.setFieldValue("driver", val);
          }}
          value={formik.values.driver}
          required
        />
        <Input
          {...getFormProps("size")}
          type="number"
          help={
            formik.values.driver === dirDriver
              ? "Not available"
              : "When left blank, defaults to 20% of free disk space. Default will be between 5GiB and 30GiB"
          }
          label="Size"
          disabled={formik.values.driver === dirDriver}
        />
        <Input
          {...getFormProps("source")}
          type="text"
          disabled={formik.values.driver === btrfsDriver}
          help={getSourceHelpForDriver(formik.values.driver)}
          label="Source"
        />
      </Col>
    </Row>
  );
};

export default StoragePoolFormMain;
