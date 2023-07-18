import React, { FC } from "react";
import { MainTable, Row, useNotify } from "@canonical/react-components";
import { fetchWarnings } from "api/warnings";
import { isoTimeToString } from "util/helpers";
import BaseLayout from "components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import NotificationRow from "components/NotificationRow";

const WarningList: FC = () => {
  const notify = useNotify();

  const {
    data: warnings = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.warnings],
    queryFn: fetchWarnings,
  });

  if (error) {
    notify.failure("Loading warnings failed", error);
  }

  const headers = [
    { content: "Type", sortKey: "type" },
    { content: "Last message", sortKey: "lastMessage" },
    { content: "Status", sortKey: "status" },
    { content: "Severity", sortKey: "severity" },
    { content: "Count", sortKey: "count", className: "u-align--right" },
    { content: "Project", sortKey: "project" },
    { content: "First seen", sortKey: "firstSeen" },
    { content: "Last seen", sortKey: "lastSeen" },
  ];

  const rows = warnings.map((warning) => {
    return {
      columns: [
        {
          content: warning.type,
          role: "rowheader",
          "aria-label": "Type",
        },
        {
          content: warning.last_message,
          role: "rowheader",
          "aria-label": "Last message",
        },
        {
          content: warning.status,
          role: "rowheader",
          "aria-label": "Status",
        },
        {
          content: warning.severity,
          role: "rowheader",
          "aria-label": "Severity",
        },
        {
          content: warning.count,
          role: "rowheader",
          className: "u-align--right",
          "aria-label": "Count",
        },
        {
          content: warning.project,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Project",
        },
        {
          content: isoTimeToString(warning.first_seen_at),
          role: "rowheader",
          "aria-label": "First seen",
        },
        {
          content: isoTimeToString(warning.last_seen_at),
          role: "rowheader",
          "aria-label": "Last seen",
        },
      ],
      sortData: {
        type: warning.type,
        lastMessage: warning.last_message.toLowerCase(),
        status: warning.status,
        severity: warning.severity,
        count: warning.count,
        project: warning.project.toLowerCase(),
        firstSeen: warning.first_seen_at,
        lastSeen: warning.last_seen_at,
      },
    };
  });

  return (
    <>
      <BaseLayout title="Warnings">
        <NotificationRow />
        <Row>
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="u-table-layout--auto"
            emptyStateMsg={
              isLoading ? (
                <Loader text="Loading warnings..." />
              ) : (
                "No data to display"
              )
            }
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default WarningList;
