import type { LxdWarningSeverity, LxdWarningStatus } from "types/warning";

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
