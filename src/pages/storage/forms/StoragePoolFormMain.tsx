import { FC, ReactNode } from "react";
import { Row, Input, Select, Col } from "@canonical/react-components";
import { FormikProps } from "formik";
import {
  zfsDriver,
  dirDriver,
  btrfsDriver,
  getSourceHelpForDriver,
  cephDriver,
  getStorageDriverOptions,
  powerFlex,
} from "util/storageOptions";
import { StoragePoolFormValues } from "./StoragePoolForm";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import { getCephPoolFormFields } from "util/storagePool";
import { useSettings } from "context/useSettings";
import ScrollableForm from "components/ScrollableForm";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormMain: FC<Props> = ({ formik }) => {
  const { data: settings } = useSettings();

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

  const isCephDriver = formik.values.driver === cephDriver;
  const isDirDriver = formik.values.driver === dirDriver;
  const isPowerFlexDriver = formik.values.driver === powerFlex;
  const storageDriverOptions = getStorageDriverOptions(settings);

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Input
            {...getFormProps("name")}
            type="text"
            label="Name"
            required
            disabled={!formik.values.isCreating || formik.values.readOnly}
            help={
              !formik.values.isCreating
                ? "Cannot rename storage pools"
                : undefined
            }
          />
          <AutoExpandingTextArea
            {...getFormProps("description")}
            label="Description"
            disabled={formik.values.readOnly}
            dynamicHeight
          />
          <Select
            id="driver"
            name="driver"
            help={
              !formik.values.isCreating
                ? "Driver can't be changed"
                : formik.values.driver === zfsDriver
                  ? "ZFS gives best performance and reliability"
                  : undefined
            }
            label="Driver"
            options={storageDriverOptions}
            onChange={(target) => {
              const val = target.target.value;
              if (val === dirDriver) {
                void formik.setFieldValue("size", "");
              }
              if (val === btrfsDriver) {
                void formik.setFieldValue("source", "");
              }
              if (val !== cephDriver) {
                const cephFields = getCephPoolFormFields();
                for (const field of cephFields) {
                  void formik.setFieldValue(field, undefined);
                }
              }

              void formik.setFieldValue("driver", val);
            }}
            value={formik.values.driver}
            required
            disabled={!formik.values.isCreating || formik.values.readOnly}
          />
          {!isCephDriver && !isDirDriver && !isPowerFlexDriver && (
            <DiskSizeSelector
              label="Size"
              value={formik.values.size}
              help={
                formik.values.driver === dirDriver
                  ? "Not available"
                  : "When left blank, defaults to 20% of free disk space. Default will be between 5GiB and 30GiB"
              }
              setMemoryLimit={(val?: string) =>
                void formik.setFieldValue("size", val)
              }
              disabled={
                formik.values.driver === dirDriver || formik.values.readOnly
              }
            />
          )}
          {!isPowerFlexDriver && (
            <Input
              {...getFormProps("source")}
              type="text"
              disabled={
                formik.values.driver === btrfsDriver ||
                !formik.values.isCreating ||
                formik.values.readOnly
              }
              help={
                formik.values.isCreating
                  ? getSourceHelpForDriver(formik.values.driver)
                  : "Source can't be changed"
              }
              label="Source"
            />
          )}
          {isPowerFlexDriver && (
            <>
              <Input
                {...formik.getFieldProps("powerflex_pool")}
                type="text"
                label="Powerflex pool"
                placeholder="Enter powerflex pool"
                help="ID or name of the remote PowerFlex storage pool"
                required
              />
              <Input
                {...formik.getFieldProps("powerflex_domain")}
                type="text"
                label="Domain"
                placeholder="Enter domain"
                help="Name of the PowerFlex protection domain. Required if the Powerflex pool is a name."
              />
              <Input
                {...formik.getFieldProps("powerflex_gateway")}
                type="text"
                label="Gateway"
                placeholder="Enter gateway"
                help="Address of the PowerFlex Gateway"
                required
              />
              <Input
                {...formik.getFieldProps("powerflex_user_name")}
                type="text"
                label="User"
                placeholder="Enter user"
                help={
                  <>
                    User for PowerFlex Gateway authentication. Defaults to{" "}
                    <code>admin</code> if left empty.
                  </>
                }
              />
              <Input
                {...formik.getFieldProps("powerflex_user_password")}
                type="password"
                label="Password"
                placeholder="Enter password"
                help="Password for PowerFlex Gateway authentication"
                required
              />
            </>
          )}
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default StoragePoolFormMain;
