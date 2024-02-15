import { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { ProjectFormValues } from "pages/projects/CreateProject";
import { FormikProps } from "formik/dist/types";
import { optionAllowBlock, optionAllowBlockManaged } from "util/projectOptions";
import { optionRenderer } from "util/formFields";
import { getProjectKey } from "util/projectConfigFields";

export interface DeviceUsageRestrictionFormValues {
  restricted_devices_disk?: string;
  restricted_devices_disk_paths?: string;
  restricted_devices_gpu?: string;
  restricted_devices_infiniband?: string;
  restricted_devices_nic?: string;
  restricted_devices_pci?: string;
  restricted_devices_unix_block?: string;
  restricted_devices_unix_char?: string;
  restricted_devices_unix_hotplug?: string;
  restricted_devices_usb?: string;
}

export const deviceUsageRestrictionPayload = (
  values: DeviceUsageRestrictionFormValues,
) => {
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
