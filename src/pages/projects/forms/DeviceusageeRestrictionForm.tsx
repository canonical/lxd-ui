import React, { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getConfigurationRow } from "pages/instances/forms/ConfigurationRow";
import ConfigurationTable from "pages/instances/forms/ConfigurationTable";
import { CreateProjectFormValues } from "pages/projects/CreateProjectForm";
import { FormikProps } from "formik/dist/types";
import { stringAllowBlock, stringBlockManagedAllow } from "util/projectOptions";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";

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
    ["restricted.devices.disk"]: values.restricted_devices_disk,
    ["restricted.devices.disk.paths"]: values.restricted_devices_disk_paths,
    ["restricted.devices.gpu"]: values.restricted_devices_gpu,
    ["restricted.devices.infiniband"]: values.restricted_devices_infiniband,
    ["restricted.devices.nic"]: values.restricted_devices_nic,
    ["restricted.devices.pci"]: values.restricted_devices_pci,
    ["restricted.devices.unix-block"]: values.restricted_devices_unix_block,
    ["restricted.devices.unix-char"]: values.restricted_devices_unix_char,
    ["restricted.devices.unix-hotplug"]: values.restricted_devices_unix_hotplug,
    ["restricted.devices.usb"]: values.restricted_devices_usb,
  };
};

interface Props {
  formik: FormikProps<CreateProjectFormValues>;
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
          children: (
            <Select
              id="restricted_devices_disk"
              name="restricted_devices_disk"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringBlockManagedAllow}
              value={formik.values.restricted_devices_disk}
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
              id="restricted_devices_disk_paths"
              name="restricted_devices_disk_paths"
              placeholder="Enter paths"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.restricted_devices_disk_paths}
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
          children: (
            <Select
              id="restricted_devices_gpu"
              name="restricted_devices_gpu"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restricted_devices_gpu}
              help="Prevents use of devices of type gpu."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_infiniband",
          label: "Infiniband devices",
          defaultValue: "",
          children: (
            <Select
              id="restricted_devices_infiniband"
              name="restricted_devices_infiniband"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restricted_devices_infiniband}
              help="Prevents use of devices of type infiniband."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_nic",
          label: "Network devices",
          defaultValue: "",
          children: (
            <Select
              id="restricted_devices_nic"
              name="restricted_devices_nic"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringBlockManagedAllow}
              value={formik.values.restricted_devices_nic}
              help="If block prevent use of all network devices. If managed allow use of network devices only if network= is set. If allow, no restrictions apply. This also controls access to networks."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_pci",
          label: "PCI devices",
          defaultValue: "",
          children: (
            <Select
              id="restricted_devices_pci"
              name="restricted_devices_pci"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restricted_devices_pci}
              help="Prevents use of devices of type pci."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_unix_block",
          label: "Unix-block devices",
          defaultValue: "",
          children: (
            <Select
              id="restricted_devices_unix_block"
              name="restricted_devices_unix_block"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restricted_devices_unix_block}
              help="Prevents use of devices of type unix-block."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_unix_char",
          label: "Unix-char devices",
          defaultValue: "",
          children: (
            <Select
              id="restricted_devices_unix_char"
              name="restricted_devices_unix_char"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restricted_devices_unix_char}
              help="Prevents use of devices of type unix-char."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_unix_hotplug",
          label: "Unix-hotplug devices",
          defaultValue: "",
          children: (
            <Select
              id="restricted_devices_unix_hotplug"
              name="restricted_devices_unix_hotplug"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restricted_devices_unix_hotplug}
              help="Prevents use of devices of type unix-hotplug."
            />
          ),
        }),

        getConfigurationRow({
          formik: formik as unknown as SharedFormikTypes,
          name: "restricted_devices_usb",
          label: "USB devices",
          defaultValue: "",
          children: (
            <Select
              id="restricted_devices_usb"
              name="restricted_devices_usb"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={stringAllowBlock}
              value={formik.values.restricted_devices_usb}
              help="Prevents use of devices of type usb."
            />
          ),
        }),
      ]}
    />
  );
};

export default DeviceUsageRestrictionForm;
