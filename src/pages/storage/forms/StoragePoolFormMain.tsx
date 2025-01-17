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
  pureStorage,
  cephFSDriver,
} from "util/storageOptions";
import { StoragePoolFormValues } from "./StoragePoolForm";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import { getCephPoolFormFields } from "util/storagePool";
import { useSettings } from "context/useSettings";
import ScrollableForm from "components/ScrollableForm";
import { ensureEditMode } from "util/instanceEdit";
import { optionTrueFalse } from "util/instanceOptions";

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
  const isCephFSDriver = formik.values.driver === cephFSDriver;
  const isDirDriver = formik.values.driver === dirDriver;
  const isPowerFlexDriver = formik.values.driver === powerFlex;
  const isPureDriver = formik.values.driver === pureStorage;
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
            disabled={!formik.values.isCreating}
            help={
              !formik.values.isCreating
                ? "Cannot rename storage pools"
                : undefined
            }
          />
          <AutoExpandingTextArea
            {...getFormProps("description")}
            label="Description"
            onChange={(e) => {
              ensureEditMode(formik);
              formik.handleChange(e);
            }}
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
            disabled={!formik.values.isCreating}
          />
          {!isCephDriver &&
            !isCephFSDriver &&
            !isDirDriver &&
            !isPureDriver &&
            !isPowerFlexDriver && (
              <DiskSizeSelector
                label="Size"
                value={formik.values.size}
                help={
                  formik.values.driver === dirDriver
                    ? "Not available"
                    : "When left blank, defaults to 20% of free disk space. Default will be between 5GiB and 30GiB"
                }
                setMemoryLimit={(val?: string) => {
                  ensureEditMode(formik);
                  void formik.setFieldValue("size", val);
                }}
                disabled={formik.values.driver === dirDriver}
              />
            )}
          {!isPureDriver && !isPowerFlexDriver && (
            <Input
              {...getFormProps("source")}
              type="text"
              disabled={
                formik.values.driver === btrfsDriver ||
                !formik.values.isCreating
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
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
              <Input
                {...formik.getFieldProps("powerflex_domain")}
                type="text"
                label="Domain"
                placeholder="Enter domain"
                help="Name of the PowerFlex protection domain. Required if the Powerflex pool is a name."
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
              />
              <Input
                {...formik.getFieldProps("powerflex_gateway")}
                type="text"
                label="Gateway"
                placeholder="Enter gateway"
                help="Address of the PowerFlex Gateway"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
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
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
              />
              <Input
                {...formik.getFieldProps("powerflex_user_password")}
                type="password"
                label="Password"
                placeholder="Enter password"
                help="Password for PowerFlex Gateway authentication"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
            </>
          )}
          {isPureDriver && (
            <>
              <Input
                {...formik.getFieldProps("pure_api_token")}
                type="text"
                label="API token"
                placeholder="Enter Pure Storage API token"
                help="API token with admin access to the Pure Storage array."
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
              <Input
                {...formik.getFieldProps("pure_gateway")}
                type="text"
                label="API gateway"
                placeholder="Enter Pure Storage API gateway"
                help="URL for the Pure Storage API."
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
              <Select
                {...formik.getFieldProps("pure_gateway_verify")}
                label="Verify gateway"
                help="Whether to verify the PureStorage certificate. Set this option to false for self-signed certs, or add the cert to the OS trust store."
                options={optionTrueFalse}
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
              />
              <Select
                {...formik.getFieldProps("pure_mode")}
                label="Mode"
                help="Whether to use nvme or iscsi to connect to Pure Storage array."
                options={[
                  {
                    label: "Select option",
                    value: "",
                    disabled: true,
                  },
                  {
                    label: "NVME",
                    value: "nvme",
                  },
                  {
                    label: "ISCSI",
                    value: "iscsi",
                  },
                ]}
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
              />
            </>
          )}
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default StoragePoolFormMain;
