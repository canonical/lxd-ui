import type { FC, ReactNode } from "react";
import { Row, Input, Select, Col } from "@canonical/react-components";
import type { FormikProps } from "formik";
import {
  zfsDriver,
  dirDriver,
  getSourceHelpForDriver,
  cephDriver,
  getStorageDriverOptions,
  powerFlex,
  pureStorage,
  cephFSDriver,
  cephObject,
} from "util/storageOptions";
import type { StoragePoolFormValues } from "./StoragePoolForm";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import {
  getCephObjectPoolFormFields,
  getCephPoolFormFields,
  getPowerflexPoolFormFields,
  getPureStoragePoolFormFields,
  getZfsStoragePoolFormFields,
} from "util/storagePool";
import { useSettings } from "context/useSettings";
import ScrollableForm from "components/ScrollableForm";
import { ensureEditMode } from "util/instanceEdit";
import ClusteredSourceSelector from "./ClusteredSourceSelector";
import { isClusteredServer } from "util/settings";
import ClusteredDiskSizeSelector from "components/forms/ClusteredDiskSizeSelector";
import {
  isStoragePoolWithSize,
  isStoragePoolWithSource,
} from "util/storagePoolForm";

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
  const isCephObjectDriver = formik.values.driver === cephObject;
  const isPowerFlexDriver = formik.values.driver === powerFlex;
  const isPureDriver = formik.values.driver === pureStorage;
  const storageDriverOptions = getStorageDriverOptions(settings);
  const hasClusterWideSource = isCephDriver || isCephFSDriver;
  const hasSource = !isPureDriver && !isPowerFlexDriver && !isCephObjectDriver;

  const sourceHelpText = formik.values.isCreating
    ? getSourceHelpForDriver(formik.values.driver)
    : "Source can't be changed";
  const nameHelpText = !formik.values.isCreating
    ? "Cannot rename storage pools"
    : undefined;

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
            help={nameHelpText}
          />
          <AutoExpandingTextArea
            {...getFormProps("description")}
            label="Description"
            onChange={(e) => {
              ensureEditMode(formik);
              formik.handleChange(e);
            }}
            disabled={!!formik.values.editRestriction}
            title={formik.values.editRestriction}
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
              if (val !== cephDriver) {
                const cephFields = getCephPoolFormFields();
                for (const field of cephFields) {
                  formik.setFieldValue(field, undefined);
                }
              }
              if (val !== cephObject) {
                const cephobjectFields = getCephObjectPoolFormFields();
                for (const field of cephobjectFields) {
                  formik.setFieldValue(field, undefined);
                }
              }
              if (val !== powerFlex) {
                const powerflexFields = getPowerflexPoolFormFields();
                for (const field of powerflexFields) {
                  formik.setFieldValue(field, undefined);
                }
              }
              if (val !== pureStorage) {
                const pureFields = getPureStoragePoolFormFields();
                for (const field of pureFields) {
                  formik.setFieldValue(field, undefined);
                }
              }
              if (val !== zfsDriver) {
                const zfsFields = getZfsStoragePoolFormFields();
                for (const field of zfsFields) {
                  formik.setFieldValue(field, undefined);
                }
                formik.setFieldValue("zfsPoolNamePerClusterMember", "");
              }
              if (!isStoragePoolWithSize(val)) {
                formik.setFieldValue("size", undefined);
                formik.setFieldValue("sizePerClusterMember", undefined);
              }
              if (!isStoragePoolWithSource(val)) {
                formik.setFieldValue("source", undefined);
                formik.setFieldValue("sourcePerClusterMember", undefined);
              }
              formik.setFieldValue("driver", val);
            }}
            value={formik.values.driver}
            required
            disabled={!formik.values.isCreating}
          />
          {isStoragePoolWithSize(formik.values.driver) &&
            (isClusteredServer(settings) ? (
              <ClusteredDiskSizeSelector
                id="sizePerClusterMember"
                values={formik.values.sizePerClusterMember}
                setValue={(value) => {
                  ensureEditMode(formik);
                  formik.setFieldValue("sizePerClusterMember", value);
                }}
                helpText={
                  "When left blank, defaults to 20% of free disk space. Default will be between 5GiB and 30GiB"
                }
                disabledReason={formik.values.editRestriction}
              />
            ) : (
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
                  formik.setFieldValue("size", val);
                }}
                disabled={
                  !!formik.values.editRestriction ||
                  formik.values.driver === dirDriver
                }
                disabledReason={formik.values.editRestriction}
              />
            ))}
          {hasSource &&
            (hasClusterWideSource || !isClusteredServer(settings) ? (
              <Input
                {...getFormProps("source")}
                type="text"
                disabled={
                  !!formik.values.editRestriction || !formik.values.isCreating
                }
                help={sourceHelpText}
                label="Source"
                title={formik.values.editRestriction}
              />
            ) : (
              <ClusteredSourceSelector
                formik={formik}
                helpText={sourceHelpText}
                disabledReason={formik.values.editRestriction}
              />
            ))}
          {isCephObjectDriver && (
            <>
              <Input
                {...formik.getFieldProps("cephobject_radosgw_endpoint")}
                type="text"
                label="Rados gateway endpoint"
                placeholder="Enter rados gateway endpoint"
                help="URL of the rados gateway process"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
            </>
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
            </>
          )}
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default StoragePoolFormMain;
