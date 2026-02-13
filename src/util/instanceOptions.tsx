export const instanceCreationTypes = [
  {
    label: "Container",
    value: "container",
  },
  {
    label: "VM",
    value: "virtual-machine",
  },
];

export const optionTrueFalse = [
  {
    label: "Select option",
    value: "",
    disabled: true,
  },
  {
    label: "true",
    value: "true",
  },
  {
    label: "false",
    value: "false",
  },
];

export const optionAllowDeny = [
  {
    label: "Select option",
    value: "",
    disabled: true,
  },
  {
    label: "Allow",
    value: "true",
  },
  {
    label: "Deny",
    value: "false",
  },
];

export const optionYesNo = [
  {
    label: "Select option",
    value: "",
    disabled: true,
  },
  {
    label: "Yes",
    value: "true",
  },
  {
    label: "No",
    value: "false",
  },
];

export const optionEnabledDisabled = [
  {
    label: "Select option",
    value: "",
    disabled: true,
  },
  {
    label: "Enabled",
    value: "true",
  },
  {
    label: "Disabled",
    value: "false",
  },
];

export const diskPriorities = [...Array(11).keys()].map((i) => {
  return { label: i.toString(), value: i };
});

export const proxyAddressTypeOptions = [
  {
    label: "Select option",
    value: "",
    disabled: true,
  },
  {
    label: "TCP",
    value: "tcp",
  },
  {
    label: "UDP",
    value: "udp",
  },
  {
    label: "UNIX",
    value: "unix",
  },
];

export const clusterEvacuationOptions = [
  {
    label: "Select option",
    value: "",
    disabled: true,
  },
  {
    label: "auto",
    value: "auto",
  },
  {
    label: "live-migrate",
    value: "live-migrate",
  },
  {
    label: "migrate",
    value: "migrate",
  },
  {
    label: "stop",
    value: "stop",
  },
];

export const optionIscsiNvme = [
  {
    label: "Select option",
    value: "",
    disabled: true,
  },
  {
    label: "iSCSI",
    value: "iscsi",
  },
  {
    label: "NVMe over TCP",
    value: "nvme",
  },
];

export const optionNvmeSdc = [
  {
    label: "Select option",
    value: "",
    disabled: true,
  },
  {
    label: "NVMe over TCP",
    value: "nvme",
  },
  {
    label: "Dell Storage Data Client",
    value: "sdc",
  },
];

export const bootModeOptions = [
  {
    label: "Select option",
    value: "",
    disabled: true,
  },
  {
    label: "UEFI firmware with secure boot enabled",
    value: "uefi-secureboot",
  },
  {
    label: "UEFI firmware with secure boot disabled",
    value: "uefi-nosecureboot",
  },
  {
    label: "Legacy BIOS firmware (SeaBIOS), x86_64 (amd64) only",
    value: "bios",
  },
];
