import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { optionYesNo } from "util/instanceOptions";
import type { InstanceAndProfileFormikProps } from "../../types/forms/instanceAndProfileFormProps";
import type { BootFormValues } from "types/forms/instanceAndProfile";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";

export const bootPayload = (values: BootFormValues) => {
  return {
    [getInstanceField("boot_autostart")]: values.boot_autostart?.toString(),
    [getInstanceField("boot_autostart_delay")]:
      values.boot_autostart_delay?.toString(),
    [getInstanceField("boot_autostart_priority")]:
      values.boot_autostart_priority?.toString(),
    [getInstanceField("boot_host_shutdown_timeout")]:
      values.boot_host_shutdown_timeout?.toString(),
    [getInstanceField("boot_stop_priority")]:
      values.boot_stop_priority?.toString(),
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const BootForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "Autostart",
          name: "boot_autostart",
          defaultValue: "",
          readOnlyRenderer: (val) =>
            val === "-" ? "-" : optionRenderer(val, optionYesNo),
          children: <Select options={optionYesNo} />,
        }),

        getConfigurationRow({
          formik,
          label: "Autostart delay",
          name: "boot_autostart_delay",
          defaultValue: "",
          children: <Input placeholder="Enter number" type="number" />,
        }),

        getConfigurationRow({
          formik,
          label: "Autostart priority",
          name: "boot_autostart_priority",
          defaultValue: "",
          children: <Input placeholder="Enter number" type="number" />,
        }),

        getConfigurationRow({
          formik,
          label: "Host shutdown timeout",
          name: "boot_host_shutdown_timeout",
          defaultValue: "",
          children: <Input placeholder="Enter number" type="number" />,
        }),

        getConfigurationRow({
          formik,
          label: "Stop priority",
          name: "boot_stop_priority",
          defaultValue: "",
          children: <Input placeholder="Enter number" type="number" />,
        }),
      ]}
    />
  );
};

export default BootForm;
