import React, { FC } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import { fetchWarnings } from "./api/warnings";
import { isoTimeToString } from "./util/helpers";
import BaseLayout from "./components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./util/queryKeys";
import useNotification from "./util/useNotification";

const WarningList: FC = () => {
  const notify = useNotification();

  const { data: warnings = [], error } = useQuery({
    queryKey: [queryKeys.warnings],
    queryFn: fetchWarnings,
  });

  if (error) {
    notify.failure("Could not load warnings.", error);
  }

  const headers = [
    { content: "UUID", sortKey: "uuid" },
    { content: "Type", sortKey: "type" },
    { content: "Status", sortKey: "status", className: "u-align--center" },
    { content: "Severity", sortKey: "severity", className: "u-align--center" },
    { content: "Count", sortKey: "count", className: "u-align--center" },
    { content: "Project", sortKey: "project" },
    { content: "Last seen", sortKey: "lastSeen" },
  ];

  const rows = warnings.map((warning) => {
    return {
      columns: [
        {
          content: warning.uuid,
          role: "rowheader",
          "aria-label": "UUID",
        },
        {
          content: warning.type,
          role: "rowheader",
          "aria-label": "Type",
        },
        {
          content: warning.status,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Status",
        },
        {
          content: warning.severity,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Severity",
        },
        {
          content: warning.count,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Count",
        },
        {
          content: warning.project,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Project",
        },
        {
          content: isoTimeToString(warning.last_seen_at),
          role: "rowheader",
          "aria-label": "Last seen",
        },
      ],
      sortData: {
        uuid: warning.uuid,
        type: warning.type,
        status: warning.status,
        severity: warning.severity,
        count: warning.count,
        project: warning.project,
        lastSeen: warning.last_seen_at,
      },
    };
  });

  return (
    <>
      <BaseLayout title="Warnings">
        <NotificationRow notify={notify} />
        <Row>
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="p-table--warnings"
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default WarningList;
