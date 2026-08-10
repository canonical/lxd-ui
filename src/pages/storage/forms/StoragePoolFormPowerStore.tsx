import type { FormikProps } from "formik";
import type { FC } from "react";
import type { StoragePoolFormValues } from "types/forms/storagePool";
import { getConfigurationRow } from "components/ConfigurationRow";
import { Select } from "@canonical/react-components";
import { optionTrueFalse } from "util/options";
import { optionPowerStoreMode } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { useSupportedFeatures } from "context/useSupportedFeatures";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormPowerStore: FC<Props> = ({ formik }) => {
  const { hasStorageDriverPowerstoreNvme } = useSupportedFeatures();

  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "Mode",
          name: "powerstore_mode",
          defaultValue: "",
          children: (
            <Select
              options={optionPowerStoreMode(hasStorageDriverPowerstoreNvme)}
            />
          ),
        }),
        getConfigurationRow({
          formik,
          label: "Gateway verify",
          name: "powerstore_gateway_verify",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
      ]}
    />
  );
};

export default StoragePoolFormPowerStore;
