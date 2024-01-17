import { ICONS } from "@canonical/react-components";

export const severityOrder = [
  "positive",
  "caution",
  "negative",
  "information",
] as const;

export const iconLookup = {
  positive: ICONS.success,
  information: ICONS.information,
  caution: ICONS.warning,
  negative: ICONS.error,
} as const;
