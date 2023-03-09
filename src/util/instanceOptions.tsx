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

export const booleanFields = (isInstance: boolean) =>
  isInstance ? instanceBooleanFields : profileBooleanFields;

export const instanceBooleanFields = [
  {
    label: "Inherit from profile",
    value: "",
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

export const profileBooleanFields = [
  {
    label: "Select",
    value: "",
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
