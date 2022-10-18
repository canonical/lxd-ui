import React, { FC, useEffect, useState } from "react";
import { MainTable } from "@canonical/react-components";
import NotificationRow from "./NotificationRow";
import { fetchWarningList } from "./api/warnings";
import { isoTimeToString } from "./helpers";
import { Notification } from "./types/notification";
import { LxdWarning } from "./types/warning";

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
      <div className="p-panel__header">
        <h4 className="p-panel__title">Warnings</h4>
      </div>
      <div className="p-panel__content">
        <NotificationRow
          notification={notification}
          close={() => {
            setNotification(null);
          }}
        />
        <MainTable
          headers={headers}
          rows={rows}
          paginate={30}
          responsive
          sortable
          className="p-table--warnings"
        />
      </div>
    </>
  );
};

export default WarningList;
