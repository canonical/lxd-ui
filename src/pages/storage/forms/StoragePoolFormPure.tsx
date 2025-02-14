import { FormikProps } from "formik";
import { FC } from "react";
import { StoragePoolFormValues } from "./StoragePoolForm";
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
          disabled: !!formik.values.editRestriction,
          disabledReason: formik.values.editRestriction,
        }),
        getConfigurationRow({
          formik,
          label: "Mode",
          name: "pure_mode",
          defaultValue: "",
          disabled:
            !!formik.values.editRestriction || !formik.values.isCreating,
          children: <Select options={optionIscsiNvme} />,
          disabledReason: formik.values.editRestriction,
        }),
        getConfigurationRow({
          formik,
          label: "Target",
          name: "pure_target",
          defaultValue: "",
          children: <Input type="text" />,
          disabled: !!formik.values.editRestriction,
          disabledReason: formik.values.editRestriction,
        }),
      ]}
    />
  );
};

export default StoragePoolFormPure;
