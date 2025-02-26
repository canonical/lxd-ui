import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { optionYesNo } from "util/instanceOptions";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceKey } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";

export interface BootFormValues {
  boot_autostart?: string;
  boot_autostart_delay?: string;
  boot_autostart_priority?: string;
  boot_host_shutdown_timeout?: string;
  boot_stop_priority?: string;
}

export const bootPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceKey("boot_autostart")]: values.boot_autostart?.toString(),
    [getInstanceKey("boot_autostart_delay")]:
      values.boot_autostart_delay?.toString(),
    [getInstanceKey("boot_autostart_priority")]:
      values.boot_autostart_priority?.toString(),
    [getInstanceKey("boot_host_shutdown_timeout")]:
      values.boot_host_shutdown_timeout?.toString(),
    [getInstanceKey("boot_stop_priority")]:
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
