import type { FC } from "react";
import { CustomSelect } from "@canonical/react-components";
import {
  getAlletraStoragePoolFormFields,
  getCephObjectPoolFormFields,
  getCephPoolFormFields,
  getPowerflexPoolFormFields,
  getPureStoragePoolFormFields,
  getZfsStoragePoolFormFields,
} from "util/storagePool";
import {
  zfsDriver,
  cephDriver,
  getStorageDriverOptions,
  powerFlex,
  pureStorage,
  cephObject,
  alletraDriver,
  storageDriverLabels,
} from "util/storageOptions";
import type { FormikProps } from "formik";
import type { StoragePoolFormValues } from "types/forms/storagePool";
import {
  isStoragePoolWithSize,
  isStoragePoolWithSource,
} from "util/storagePoolForm";
import { useSettings } from "context/useSettings";
import OutputField from "components/OutputField";
import DocLink from "components/DocLink";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StorageDriverSelect: FC<Props> = ({ formik }) => {
  const { data: settings } = useSettings();

  const storageDriverOptions = getStorageDriverOptions(settings);

  const cephObjectNotice = (
    <>
      RADOS gateway must be enabled for Ceph Object driver to work. If using
      microcloud or microceph, run <code>microceph enable rgw --port 8080</code>
      .
    </>
  );

  const getDriverHelpText = (driver: string, isEditing: boolean) => {
    return (
      <>
        {isEditing && <span>Driver can not be changed - </span>} This driver
        requires a storage appliance.{" "}
        <DocLink docPath={`/reference/${driver}/`} hasExternalIcon>
          Learn more
        </DocLink>
      </>
    );
  };

  const getHelpText = () => {
    const isEditing = !formik.values.isCreating;
    if (!formik.values.isCreating) {
      return "Driver can not be changed";
    } else if (formik.values.driver === zfsDriver) {
      return "ZFS gives best performance and reliability";
    } else if (formik.values.driver === powerFlex) {
      return getDriverHelpText("storage_powerflex", isEditing);
    } else if (formik.values.driver === alletraDriver) {
      return getDriverHelpText("storage_alletra", isEditing);
    } else if (formik.values.driver === pureStorage) {
      return getDriverHelpText("storage_pure", isEditing);
    } else if (formik.values.driver === cephObject) {
      return cephObjectNotice;
    }
    return undefined;
  };

  const onChange = (val: string) => {
    if (!val) return;

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
    if (val !== alletraDriver) {
      const alletraFields = getAlletraStoragePoolFormFields();
      for (const field of alletraFields) {
        formik.setFieldValue(field, undefined);
      }
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
  };

  return (
    <>
      {!formik.values.isCreating ? (
        <OutputField
          id={"driver"}
          label={"Driver"}
          value={storageDriverLabels[formik.values.driver]}
          help={getHelpText()}
        />
      ) : (
        <CustomSelect
          id="driver"
          name="driver"
          label="Driver"
          wrapperClassName="select-input"
          dropdownClassName="instance-target-dropdown"
          help={getHelpText()}
          onChange={onChange}
          options={storageDriverOptions}
          value={formik.values.driver}
          required
        />
      )}
    </>
  );
};

export default StorageDriverSelect;
