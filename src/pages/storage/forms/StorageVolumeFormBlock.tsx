import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { getStorageConfigurationRow } from "pages/storage/forms/StorageConfigurationRow";
import ConfigurationTable from "components/ConfigurationTable";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
}

const StorageVolumeFormBlock: FC<Props> = ({ formik }) => {
  return (
    <ConfigurationTable
      rows={[
        getStorageConfigurationRow({
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

        getStorageConfigurationRow({
          formik: formik,
          label: "Block mount options",
          name: "block_mount_options",
          defaultValue: "",
          help: "Mount options for block devices",
          children: (
            <Input
              type="text"
              help={
                <>
                  For a list of available options visit{" "}
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://manpages.ubuntu.com/manpages/jammy/en/man8/mount.8.html#filesystem-independent%20mount%20options"
                  >
                    mount manpages
                  </a>
                </>
              }
            />
          ),
        }),
      ]}
    />
  );
};

export default StorageVolumeFormBlock;
