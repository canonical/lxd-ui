import type { SearchAndFilterChip } from "@canonical/react-components/dist/components/SearchAndFilter/types";
import type { LxdWarningSeverity, LxdWarningStatus } from "types/warning";

export const QUERY = "query";
export const STATUS = "status";
export const SEVERITY = "severity";

export const WARNING_QUERY_PARAMS = [QUERY, STATUS, SEVERITY];

export interface WarningFilters {
  queries: string[];
  statuses: LxdWarningStatus[];
  severities: LxdWarningSeverity[];
}

export const warningStatuses: LxdWarningStatus[] = [
  "new",
  "acknowledged",
  "resolved",
];

export const warningSeverities: LxdWarningSeverity[] = [
  "low",
  "moderate",
  "high",
];

export const getSeverityChipAppearance = (
  severity: LxdWarningSeverity,
): NonNullable<SearchAndFilterChip["appearance"]> => {
  switch (severity) {
    case "high":
      return "negative";
    case "moderate":
      return "caution";
    case "low":
      return "information";
    default:
      return "caution";
  }
};

export const enhanceSeverityChipWithAppearance = (
  chip: SearchAndFilterChip,
): SearchAndFilterChip => {
  if (chip.lead !== SEVERITY) {
    return chip;
  }

  const severity = warningSeverities.find((item) => item === chip.value);

  return severity
    ? { ...chip, appearance: getSeverityChipAppearance(severity) }
    : chip;
};
