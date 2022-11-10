import React, { FC, useEffect, useState } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import { fetchWarningList } from "./api/warnings";
import { isoTimeToString } from "./util/helpers";
import { Notification } from "./types/notification";
import { LxdWarning } from "./types/warning";
import BaseLayout from "./components/BaseLayout";

const WarningList: FC = () => {
  const [warnings, setWarnings] = useState<LxdWarning[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);

  const setFailure = (message: string) => {
    setNotification({
      message,
      type: "negative",
    });
  };

  const loadWarnings = async () => {
    try {
      const warnings = await fetchWarningList();
      setWarnings(warnings);
    } catch (e) {
      setFailure("Could not load warnings");
    }
  };

  useEffect(() => {
    loadWarnings();
    let timer = setInterval(loadWarnings, 5000);
    return () => {
      clearInterval(timer);
    };
  }, []);

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
        <NotificationRow
          notification={notification}
          close={() => setNotification(null)}
        />
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
