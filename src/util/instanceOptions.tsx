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
