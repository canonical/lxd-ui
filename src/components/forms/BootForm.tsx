import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { bootModeOptions, optionYesNo } from "util/instanceOptions";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { optionRenderer } from "util/formFields";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import type { CreateInstanceFormValues } from "types/forms/instanceAndProfile";

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const BootForm: FC<Props> = ({ formik }) => {
  const { hasInstanceBootMode } = useSupportedFeatures();
  const isInstance = formik.values.entityType === "instance";
  const isVmOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !==
      "virtual-machine";

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

        ...(hasInstanceBootMode
          ? [
              getConfigurationRow({
                formik,
                label: "Boot mode (VMs only)",
                name: "boot_mode",
                defaultValue: "",
                disabled: isVmOnlyDisabled,
                disabledReason: isVmOnlyDisabled
                  ? "Only available for virtual machines"
                  : undefined,
                children: (
                  <Select
                    options={bootModeOptions}
                    disabled={isVmOnlyDisabled}
                  />
                ),
              }),
            ]
          : []),

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
