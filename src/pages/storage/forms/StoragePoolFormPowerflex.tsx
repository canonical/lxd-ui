import { FormikProps } from "formik";
import { FC } from "react";
import { StoragePoolFormValues } from "./StoragePoolForm";
import { getConfigurationRow } from "components/ConfigurationRow";
import { Input, Select } from "@canonical/react-components";
import { optionTrueFalse } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormPowerflex: FC<Props> = ({ formik }) => {
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
      ]}
    />
  );
};

export default StoragePoolFormPowerflex;
