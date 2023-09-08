import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getConfigurationRow } from "pages/instances/forms/ConfigurationRow";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { ProjectFormValues } from "pages/projects/CreateProjectForm";
import { FormikProps } from "formik/dist/types";
import { optionAllowBlock, optionAllowBlockManaged } from "util/projectOptions";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
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
  values: DeviceUsageRestrictionFormValues
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
    <ConfigurationTable
      formik={formik as unknown as SharedFormikTypes}
      rows={[
        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
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
          children: (
            <Select
              options={optionAllowBlockManaged}
              help="If block prevent use of disk devices except the root one. If managed allow use of disk devices only if pool= is set. If allow, no restrictions apply."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_disk_paths",
          label: "Disk devices path",
          defaultValue: "",
          children: (
            <Input
              placeholder="Enter paths"
              type="text"
              help="If restricted.devices.disk is set to allow, this sets a comma-separated list of path prefixes that restrict the source setting on disk devices. If empty then all paths are allowed."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_gpu",
          label: "GPU devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: (
            <Select
              options={optionAllowBlock}
              help="Use of devices of type gpu."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_infiniband",
          label: "Infiniband devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: (
            <Select
              options={optionAllowBlock}
              help="Use of devices of type infiniband."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_nic",
          label: "Network devices",
          defaultValue: "",
          readOnlyRenderer: (val) =>
            optionRenderer(val, optionAllowBlockManaged),
          children: (
            <Select
              options={optionAllowBlockManaged}
              help="If block prevent use of all network devices. If managed allow use of network devices only if network= is set. If allow, no restrictions apply. This also controls access to networks."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_pci",
          label: "PCI devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: (
            <Select
              options={optionAllowBlock}
              help="Use of devices of type pci."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_unix_block",
          label: "Unix-block devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: (
            <Select
              options={optionAllowBlock}
              help="Use of devices of type unix-block."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_unix_char",
          label: "Unix-char devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: (
            <Select
              options={optionAllowBlock}
              help="Use of devices of type unix-char."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_unix_hotplug",
          label: "Unix-hotplug devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: (
            <Select
              options={optionAllowBlock}
              help="Use of devices of type unix-hotplug."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_usb",
          label: "USB devices",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: (
            <Select
              options={optionAllowBlock}
              help="Use of devices of type usb."
            />
          ),
        }),
      ]}
    />
  );
};

export default DeviceUsageRestrictionForm;
