import type { FormikProps } from "formik";
import type { FC } from "react";
import type { StoragePoolFormValues } from "types/forms/storagePool";
import { getConfigurationRow } from "components/ConfigurationRow";
import { Input } from "@canonical/react-components";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormCephObject: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "Bucket name prefix",
          name: "cephobject_bucket_name_prefix",
          defaultValue: "",
          children: (
            <Input type="text" placeholder="Enter bucket name prefix" />
          ),
        }),
        getConfigurationRow({
          formik,
          label: "Cluster name",
          name: "cephobject_cluster_name",
          defaultValue: "",
          children: <Input type="text" placeholder="Enter cluster name" />,
        }),
        getConfigurationRow({
          formik,
          label: "Ceph user name",
          name: "cephobject_user_name",
          defaultValue: "",
          children: <Input type="text" placeholder="Enter pool name" />,
        }),
      ]}
    />
  );
};

export default StoragePoolFormCephObject;
