import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getInstanceConfigurationRow } from "components/forms/InstanceConfigurationRow";
import InstanceConfigurationTable from "components/forms/InstanceConfigurationTable";
import { ProjectFormValues } from "pages/projects/CreateProject";
import { FormikProps } from "formik/dist/types";
import { optionAllowBlock, optionAllowBlockManaged } from "util/projectOptions";
import { SharedFormikTypes } from "components/forms/sharedFormTypes";
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
    <InstanceConfigurationTable
      rows={[
        getInstanceConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_disk",
          label: (
            <>
              Disk devices
              <br />
              (except the root one)
            </>
          ),
          help: "If block prevent use of disk devices except the root one. If managed allow use of disk devices only if pool= is set. If allow, no restrictions apply.",
          defaultValue: "",
          readOnlyRenderer: (val) =>
            optionRenderer(val, optionAllowBlockManaged),
          children: <Select options={optionAllowBlockManaged} />,
        }),

        getInstanceConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_disk_paths",
          label: "Disk devices path",
          help: "If restricted.devices.disk is set to allow, this sets a comma-separated list of path prefixes that restrict the source setting on disk devices. If empty then all paths are allowed.",
          defaultValue: "",
          children: <Input placeholder="Enter paths" type="text" />,
        }),

        getInstanceConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_gpu",
          label: "GPU devices",
          help: "Use of devices of type gpu.",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getInstanceConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_infiniband",
          label: "Infiniband devices",
          help: "Use of devices of type infiniband.",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getInstanceConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_nic",
          label: "Network devices",
          help: "If block prevent use of all network devices. If managed allow use of network devices only if network= is set. If allow, no restrictions apply. This also controls access to networks.",
          defaultValue: "",
          readOnlyRenderer: (val) =>
            optionRenderer(val, optionAllowBlockManaged),
          children: <Select options={optionAllowBlockManaged} />,
        }),

        getInstanceConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_pci",
          label: "PCI devices",
          help: "Use of devices of type pci.",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getInstanceConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_unix_block",
          label: "Unix-block devices",
          help: "Use of devices of type unix-block.",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getInstanceConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_unix_char",
          label: "Unix-char devices",
          help: "Use of devices of type unix-char.",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getInstanceConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_unix_hotplug",
          label: "Unix-hotplug devices",
          help: "Use of devices of type unix-hotplug.",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getInstanceConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_usb",
          label: "USB devices",
          help: "Use of devices of type usb.",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),
      ]}
    />
  );
};

export default DeviceUsageRestrictionForm;
