import type { FormikProps } from "formik";
import type { FC } from "react";
import type { StoragePoolFormValues } from "types/forms/storagePool";
import { getConfigurationRow } from "components/ConfigurationRow";
import { Input, Select } from "@canonical/react-components";
import { optionTrueFalse } from "util/options";
import { optionNvmeSdc } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { useSupportedFeatures } from "context/useSupportedFeatures";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormPowerflex: FC<Props> = ({ formik }) => {
  const { hasStorageNvmeTcp } = useSupportedFeatures();

  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "Clone copy",
          name: "powerflex_clone_copy",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "SDT",
          name: "powerflex_sdt",
          defaultValue: "",
          children: <Input type="text" />,
        }),
        getConfigurationRow({
          formik,
          label: "Gateway verify",
          name: "powerflex_gateway_verify",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "Mode",
          name: "powerflex_mode",
          defaultValue: "",
          children: <Select options={optionNvmeSdc(hasStorageNvmeTcp)} />,
        }),
        ...(formik.values.powerflex_version
          ? [
              getConfigurationRow({
                formik,
                label: "Storage array version",
                name: "powerflex_version",
                defaultValue: formik.values.powerflex_version || "",
                children: <></>,
                hideOverrideBtn: true,
              }),
            ]
          : []),
      ]}
    />
  );
};

export default StoragePoolFormPowerflex;
