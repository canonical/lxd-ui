import { FormikProps } from "formik";
import { FC } from "react";
import { StoragePoolFormValues } from "./StoragePoolForm";
import { getConfigurationRow } from "components/ConfigurationRow";
import { Input, Select } from "@canonical/react-components";
import { optionTrueFalse } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormZFS: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "ZFS pool name",
          name: "zfs_pool_name",
          defaultValue: "",
          children: <Input type="text" placeholder="Enter ZFS pool name" />,
          disabled: !formik.values.isCreating || formik.values.readOnly,
          disabledReason: "ZFS pool name cannot be modified",
        }),
        getConfigurationRow({
          formik,
          label: "Clone copy",
          name: "zfs_clone_copy",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "Export",
          name: "zfs_export",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
      ]}
    />
  );
};

export default StoragePoolFormZFS;
