import React, { FC } from "react";
import { Input } from "@canonical/react-components";
import { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { FormikProps } from "formik/dist/types";
import ConfigurationTable from "pages/storage/forms/ConfigurationTable";
import { getConfigurationRow } from "pages/storage/forms/ConfigurationRow";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
}

const StorageVolumeFormLVM: FC<Props> = ({ formik }) => {
  return (
    <ConfigurationTable
      rows={[
        getConfigurationRow({
          formik: formik,
          label: "LVM stripes",
          name: "lvm_stripes",
          defaultValue: "",
          help: "Number of stripes to use for new volumes (or thin pool volume)",
          children: <Input type="number" />,
        }),

        getConfigurationRow({
          formik: formik,
          label: "LVM stripes size",
          name: "lvm_stripes_size",
          defaultValue: "",
          help: "Size of stripes to use (at least 4096 bytes and multiple of 512bytes)",
          children: <Input type="number" />,
        }),
      ]}
    />
  );
};

export default StorageVolumeFormLVM;
