import type { IconName } from "@canonical/ds-assets";

export const severityOrder = [
  "positive",
  "caution",
  "negative",
  "information",
] as const;

export const iconLookup: Record<(typeof severityOrder)[number], IconName> = {
  positive: "success-fill",
  information: "information",
  caution: "warning",
  negative: "error-fill",
};
