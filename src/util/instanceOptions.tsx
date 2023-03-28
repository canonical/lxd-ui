export const instanceListTypes = [
  {
    label: "Containers",
    value: "container",
  },
  {
    label: "VMs",
    value: "virtual-machine",
  },
];

export const instanceCreationTypes = [
  {
    label: "Container",
    value: "container",
  },
  {
    label: "Virtual Machine",
    value: "virtual-machine",
  },
];

export const instanceStatuses = [
  {
    label: "Running",
    value: "Running",
  },
  {
    label: "Stopped",
    value: "Stopped",
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

export const diskPriorities = [...Array(11).keys()].map((i) => {
  return { label: i.toString(), value: i };
});
