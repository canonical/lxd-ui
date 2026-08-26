import { Chip } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import type { SearchAndFilterChip } from "@canonical/react-components/dist/components/SearchAndFilter/types";
import type {
  LxdWarning,
  LxdWarningSeverity,
  LxdWarningStatus,
} from "types/warning";
import { isoTimeToString } from "util/helpers";

export const QUERY = "query";
export const STATUS = "status";
export const SEVERITY = "severity";

export const WARNING_QUERY_PARAMS = [QUERY, STATUS, SEVERITY];

export type WarningVariant = "full" | "overview";

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

export const warningSeverityOrder: Record<LxdWarningSeverity, number> = {
  low: 1,
  moderate: 2,
  high: 3,
};

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

export const getWarningHeaders = (variant: WarningVariant = "full") => {
  const baseHeaders = [
    { content: "Type", sortKey: "type", className: "type" },
    {
      content: "Last message",
      sortKey: "lastMessage",
      className: "last_message",
    },
    { content: "Status", sortKey: "status", className: "status" },
    { content: "Severity", sortKey: "severity", className: "severity" },
  ];

  const extendedHeaders = [
    {
      content: "Count",
      sortKey: "count",
      className: "count u-align--right",
    },
    { content: "Project", sortKey: "project", className: "project" },
    { content: "First seen", sortKey: "firstSeen", className: "first_seen_at" },
    {
      content: "Last seen",
      sortKey: "lastSeen",
      className: "last_seen_at",
    },
  ];

  return variant === "overview"
    ? baseHeaders
    : [...baseHeaders, ...extendedHeaders];
};

export const getWarningRows = (
  warnings: LxdWarning[],
  variant: WarningVariant = "full",
): MainTableRow[] => {
  return warnings.map((warning) => {
    const baseColumns = [
      {
        content: warning.type,
        role: "rowheader",
        "aria-label": "Type",
        className: "type",
      },
      {
        content: warning.last_message,
        role: "cell",
        "aria-label": "Last message",
        className: "last_message",
        title: warning.last_message,
      },
      {
        content: warning.status,
        role: "cell",
        "aria-label": "Status",
        className: "status",
      },
      {
        content: (
          <Chip
            value={warning.severity}
            appearance={getSeverityChipAppearance(warning.severity)}
            isReadOnly
          />
        ),
        role: "cell",
        "aria-label": "Severity",
        className: "severity",
      },
    ];

    const extendedColumns = [
      {
        content: warning.count,
        role: "cell",
        className: "count u-align--right",
        "aria-label": "Count",
      },
      {
        content: warning.project,
        role: "cell",
        className: "project",
        "aria-label": "Project",
      },
      {
        content: isoTimeToString(warning.first_seen_at),
        role: "cell",
        "aria-label": "First seen",
        className: "first_seen_at",
      },
      {
        content: isoTimeToString(warning.last_seen_at),
        role: "cell",
        "aria-label": "Last seen",
        className: "last_seen_at",
      },
    ];

    return {
      key: warning.uuid,
      name: warning.uuid,
      className: "u-row",
      columns:
        variant === "overview"
          ? baseColumns
          : [...baseColumns, ...extendedColumns],
      sortData: {
        type: warning.type,
        lastMessage: warning.last_message.toLowerCase(),
        status: warning.status,
        severity: warningSeverityOrder[warning.severity],
        count: warning.count,
        project: warning.project.toLowerCase(),
        firstSeen: warning.first_seen_at,
        lastSeen: warning.last_seen_at,
      },
    };
  });
};
