import { ICONS } from "@canonical/react-components";

export const severityOrder = [
  "positive",
  "caution",
  "negative",
  "information",
] as const;

export const iconLookup = {
  positive: ICONS.success,
  // custom name for info icon to override default color from vanilla
  information: "info--notification",
  caution: ICONS.warning,
  negative: ICONS.error,
} as const;
