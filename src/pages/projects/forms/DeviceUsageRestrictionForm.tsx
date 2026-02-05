import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import type { ProjectFormValues } from "types/forms/project";
import type { FormikProps } from "formik/dist/types";
import { optionAllowBlock, optionAllowBlockManaged } from "util/projectOptions";
import { optionRenderer } from "util/formFields";
import { getProjectKey } from "util/projectConfigFields";
import type { LxdConfigPair } from "types/config";
import type { DeviceUsageRestrictionFormValues } from "types/forms/project";

export const deviceUsageRestrictionPayload = (
  values: DeviceUsageRestrictionFormValues,
): LxdConfigPair => {
  return {
    [getProjectKey("restricted_devices_disk")]: values.restricted_devices_disk,
    [getProjectKey("restricted_devices_disk_paths")]:
      values.restricted_devices_disk_paths,
    [getProjectKey("restricted_devices_gpu")]: values.restricted_devices_gpu,
    [getProjectKey("restricted_devices_infiniband")]:
      values.restricted_devices_infiniband,
    [getProjectKey("restricted_devices_nic")]: values.restricted_devices_nic,
    [getProjectKey("restricted_devices_pci")]: values.restricted_devices_pci,
    [getProjectKey("restricted_devices_unix_block")]:
      values.restricted_devices_unix_block,
    [getProjectKey("restricted_devices_unix_char")]:
      values.restricted_devices_unix_char,
    [getProjectKey("restricted_devices_unix_hotplug")]:
      values.restricted_devices_unix_hotplug,
    [getProjectKey("restricted_devices_usb")]: values.restricted_devices_usb,
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const DeviceUsageRestrictionForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "restricted_devices_disk",
          label: (
            <>
              Disk devices
              <br />
              (except the root one)
            </>
          ),
          defaultValue: "",
          readOnlyRenderer: (val) =>
            optionRenderer(val, optionAllowBlockManaged),
          children: <Select options={optionAllowBlockManaged} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_disk_paths",
          label: "Disk devices path",
          defaultValue: "",
          children: <Input placeholder="Enter paths" type="text" />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_gpu",
          label: "GPU devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_infiniband",
          label: "Infiniband devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_nic",
          label: "Network devices",
          defaultValue: "",
          readOnlyRenderer: (val) =>
            optionRenderer(val, optionAllowBlockManaged),
          children: <Select options={optionAllowBlockManaged} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_pci",
          label: "PCI devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_unix_block",
          label: "Unix-block devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_unix_char",
          label: "Unix-char devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_unix_hotplug",
          label: "Unix-hotplug devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_usb",
          label: "USB devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),
      ]}
    />
  );
};

export default DeviceUsageRestrictionForm;
