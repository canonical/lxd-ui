import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { FormikProps } from "formik/dist/types";
import ConfigurationTable from "pages/storage/forms/ConfigurationTable";
import { getConfigurationRow } from "pages/storage/forms/ConfigurationRow";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
}

const StorageVolumeFormZFS: FC<Props> = ({ formik }) => {
  return (
    <ConfigurationTable
      rows={[
        getConfigurationRow({
          formik: formik,
          label: "ZFS blocksize",
          name: "zfs_blocksize",
          defaultValue: "",
          help: "Size of the ZFS blocks",
          children: (
            <Select
              options={[
                {
                  label: "default",
                  value: "",
                },
                {
                  label: "512",
                  value: "512",
                },
                {
                  label: "1024",
                  value: "1024",
                },
                {
                  label: "2048",
                  value: "2048",
                },
                {
                  label: "4096",
                  value: "4096",
                },
                {
                  label: "8192",
                  value: "8192",
                },
                {
                  label: "16384",
                  value: "16384",
                },
              ]}
            />
          ),
        }),

        getConfigurationRow({
          formik: formik,
          label: "ZFS block mode",
          name: "zfs_block_mode",
          defaultValue: "",
          help: "Whether to use a formatted zvol rather than a dataset (zfs.block_mode can be set only for custom storage volumes; use volume.zfs.block_mode to enable ZFS block mode for all storage volumes in the pool, including instance volumes)",
          children: <Input type="checkbox" label="ZFS block mode" />,
        }),

        getConfigurationRow({
          formik: formik,
          label: "ZFS delegate",
          name: "zfs_delegate",
          defaultValue: "",
          help: "Controls whether to delegate the ZFS dataset and anything underneath it to the container(s) using it. Allows the use of the zfs command in the container.",
          children: <Input type="checkbox" label="ZFS delegate" />,
        }),

        getConfigurationRow({
          formik: formik,
          label: "ZFS remove snapshots",
          name: "zfs_remove_snapshots",
          defaultValue: "",
          help: "Remove snapshots as needed",
          children: <Input type="checkbox" label="ZFS remove snapshots" />,
        }),

        getConfigurationRow({
          formik: formik,
          label: "ZFS use refquota",
          name: "zfs_use_refquota",
          defaultValue: "",
          help: "Use refquota instead of quota for space",
          children: <Input type="checkbox" label="ZFS use refquota" />,
        }),

        getConfigurationRow({
          formik: formik,
          label: "ZFS reserve space",
          name: "zfs_reserve_space",
          defaultValue: "",
          help: "Use reservation/refreservation along with quota/refquota",
          children: <Input type="checkbox" label="ZFS reserve space" />,
        }),
      ]}
    />
  );
};

export default StorageVolumeFormZFS;
