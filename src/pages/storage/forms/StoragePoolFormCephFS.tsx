import type { FormikProps } from "formik";
import type { FC } from "react";
import type { StoragePoolFormValues } from "types/forms/storagePool";
import { getConfigurationRow } from "components/ConfigurationRow";
import { Input, Select } from "@canonical/react-components";
import { optionTrueFalse } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormCephFS: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "Cluster name",
          name: "cephfs_cluster_name",
          defaultValue: "",
          children: <Input type="text" placeholder="Enter cluster name" />,
        }),
        getConfigurationRow({
          formik,
          label: "Create missing",
          name: "cephfs_create_missing",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "FS cache",
          name: "cephfs_fscache",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "Number of placement groups",
          name: "cephfs_osd_pg_num",
          defaultValue: "",
          children: <Input type="text" placeholder="Enter number" />,
        }),
        getConfigurationRow({
          formik,
          label: "Path",
          name: "cephfs_path",
          defaultValue: "",
          children: <Input type="text" placeholder="Enter path" />,
        }),
        getConfigurationRow({
          formik,
          label: "Ceph user name",
          name: "cephfs_user_name",
          defaultValue: "",
          children: <Input type="text" placeholder="Enter pool name" />,
        }),
      ]}
    />
  );
};

export default StoragePoolFormCephFS;
