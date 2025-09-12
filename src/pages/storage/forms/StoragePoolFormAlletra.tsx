import type { FormikProps } from "formik";
import type { FC } from "react";
import type { StoragePoolFormValues } from "./StoragePoolForm";
import { getConfigurationRow } from "components/ConfigurationRow";
import { Input, Select } from "@canonical/react-components";
import { optionIscsiNvme, optionTrueFalse } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormAlletra: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "Verify Certificate",
          name: "alletra_wsapi_verify",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "Target",
          name: "alletra_target",
          defaultValue: "",
          children: <Input type="text" />,
        }),
        getConfigurationRow({
          formik,
          label: "Mode",
          name: "alletra_mode",
          defaultValue: "",
          children: <Select options={optionIscsiNvme} />,
        }),
      ]}
    />
  );
};

export default StoragePoolFormAlletra;
