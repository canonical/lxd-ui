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

const StoragePoolFormCeph: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "Cluster name",
          name: "ceph_cluster_name",
          defaultValue: "",
          children: <Input type="text" placeholder="Enter cluster name" />,
        }),
        getConfigurationRow({
          formik,
          label: "Placement groups",
          name: "ceph_osd_pg_num",
          defaultValue: "",
          children: (
            <Input
              type="number"
              placeholder="Enter number of placement groups"
            />
          ),
        }),
        getConfigurationRow({
          formik,
          label: "RBD clone copy",
          name: "ceph_rbd_clone_copy",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "Ceph user name",
          name: "ceph_user_name",
          defaultValue: "",
          children: <Input type="text" placeholder="Enter Ceph user name" />,
        }),
        getConfigurationRow({
          formik,
          label: "RBD features",
          name: "ceph_rbd_features",
          defaultValue: "",
          children: <Input type="text" placeholder="Enter RBD features" />,
        }),
      ]}
    />
  );
};

export default StoragePoolFormCeph;
