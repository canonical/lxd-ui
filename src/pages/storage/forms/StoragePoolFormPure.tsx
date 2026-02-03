import type { FormikProps } from "formik";
import type { FC } from "react";
import type { StoragePoolFormValues } from "types/forms/storagePool";
import { getConfigurationRow } from "components/ConfigurationRow";
import { Input, Select } from "@canonical/react-components";
import { optionIscsiNvme, optionTrueFalse } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormPure: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "Gateway verify",
          name: "pure_gateway_verify",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "Mode",
          name: "pure_mode",
          defaultValue: "",
          disabled: !formik.values.isCreating,
          children: <Select options={optionIscsiNvme} />,
        }),
        getConfigurationRow({
          formik,
          label: "Target",
          name: "pure_target",
          defaultValue: "",
          children: <Input type="text" />,
        }),
      ]}
    />
  );
};

export default StoragePoolFormPure;
