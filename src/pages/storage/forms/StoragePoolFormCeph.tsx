import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ConfigurationTable from "components/ConfigurationTable";
import ScrollableForm from "components/ScrollableForm";
import type { FormikProps } from "formik";
import StoragePoolFormCephReplicators from "pages/storage/forms/StoragePoolFormCephReplicators";
import type { StoragePoolFormValues } from "types/forms/storagePool";
import { optionTrueFalse } from "util/options";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormCeph: FC<Props> = ({ formik }) => {
  const updateCloneCopy = (cloneCopy: string | undefined): void => {
    void formik.setValues({
      ...formik.values,
      ceph_rbd_clone_copy: cloneCopy,
      ceph_replicators:
        cloneCopy === "true" || cloneCopy === undefined
          ? []
          : formik.values.ceph_replicators,
    });
  };

  return (
    <ScrollableForm>
      <ConfigurationTable
        className="ceph-configuration-table u-no-margin--bottom"
        rows={[
          getConfigurationRow({
            formik,
            label: "Ceph OSD pool name",
            name: "ceph_osd_pool_name",
            defaultValue: "",
            children: <Input type="text" placeholder="Enter pool name" />,
          }),
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
          getConfigurationRow({
            formik,
            label: "RBD disk usage",
            name: "ceph_rbd_du",
            defaultValue: "",
            children: <Select options={optionTrueFalse} />,
          }),
          getConfigurationRow({
            formik,
            label: "RBD clone copy",
            name: "ceph_rbd_clone_copy",
            defaultValue: "",
            help: "For RBD mirroring, set to false before creating any containers on this pool. Ceph cannot mirror volumes cloned from images, and this setting applies to all projects that use the pool.",
            onChange: (event) => {
              updateCloneCopy(event.target.value);
            },
            clearOverride: () => {
              updateCloneCopy(undefined);
            },
            children: <Select options={optionTrueFalse} />,
          }),
        ]}
      />
      <StoragePoolFormCephReplicators formik={formik} />
    </ScrollableForm>
  );
};

export default StoragePoolFormCeph;
