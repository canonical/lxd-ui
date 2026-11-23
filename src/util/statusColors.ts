// Preserve Vanilla's status palette while migrating icons and charts to DS.
// Issue is tracked in WD-38790
export const statusColors = {
  positive: "#0E8420",
  caution: "#CC7900",
  negative: "#C7162B",
  information: "#24598F",
  neutral: "#808080",
} as const;

export type StatusTone = keyof typeof statusColors;
