import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { getConfigurationRow } from "pages/storage/forms/ConfigurationRow";
import ConfigurationTable from "pages/storage/forms/ConfigurationTable";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
}

const StorageVolumeFormBlock: FC<Props> = ({ formik }) => {
  return (
    <ConfigurationTable
      rows={[
        getConfigurationRow({
          formik: formik,
          label: "Block filesystem",
          name: "block_filesystem",
          defaultValue: "",
          help: "Filesystem of the storage volume",
          children: (
            <Select
              options={[
                {
                  label: "auto",
                  value: "",
                },
                {
                  label: "btrfs",
                  value: "btrfs",
                },
                {
                  label: "ext4",
                  value: "ext4",
                },
                {
                  label: "xfs",
                  value: "xfs",
                },
              ]}
            />
          ),
        }),

        getConfigurationRow({
          formik: formik,
          label: "Block mount options",
          name: "block_mount_options",
          defaultValue: "",
          help: "Mount options for block devices",
          children: <Input type="text" />,
        }),
      ]}
    />
  );
};

export default StorageVolumeFormBlock;
