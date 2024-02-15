import { FC } from "react";
import { Select } from "@canonical/react-components";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import { optionTrueFalse } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
}

const StorageVolumeFormZFS: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "ZFS blocksize",
          name: "zfs_blocksize",
          defaultValue: "",
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
          formik,
          label: "ZFS block mode",
          name: "zfs_block_mode",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),

        getConfigurationRow({
          formik,
          label: "ZFS delegate",
          name: "zfs_delegate",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),

        getConfigurationRow({
          formik,
          label: "ZFS remove snapshots",
          name: "zfs_remove_snapshots",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),

        getConfigurationRow({
          formik,
          label: "ZFS use refquota",
          name: "zfs_use_refquota",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),

        getConfigurationRow({
          formik,
          label: "ZFS reserve space",
          name: "zfs_reserve_space",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
      ]}
    />
  );
};

export default StorageVolumeFormZFS;
