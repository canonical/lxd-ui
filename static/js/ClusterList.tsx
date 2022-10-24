import React, { FC, useEffect, useState } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "./NotificationRow";
import { Notification } from "./types/notification";
import { LxdClusterMember } from "./types/cluster";
import { fetchClusterMembers } from "./api/cluster";

const ClusterList: FC = () => {
  const [members, setMembers] = useState<LxdClusterMember[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);

  const setFailure = (message: string) => {
    setNotification({
      message,
      type: "negative",
    });
  };

  const loadClusterMembers = async () => {
    try {
      const clusterMembers = await fetchClusterMembers();
      setMembers(clusterMembers);
    } catch (e) {
      setFailure("Could not load images.");
    }
  };

  useEffect(() => {
    loadClusterMembers();
  }, []);

  const headers = [
    { content: "Name" },
    { content: "Url", sortKey: "url" },
    { content: "Roles", sortKey: "roles", className: "u-align--center" },
    { content: "Architecture", sortKey: "architecture" },
    { content: "Failure Domain", sortKey: "failureDomain" },
    { content: "Description", sortKey: "description" },
    { content: "State", sortKey: "state", className: "u-align--center" },
    { content: "Message", sortKey: "message" },
    { content: "Actions", className: "u-align--center" },
  ];

  const rows = members.map((member) => {
    return {
      columns: [
        {
          content: member.server_name,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: member.url,
          role: "rowheader",
          "aria-label": "Url",
        },
        {
          content: member.roles.join(", "),
          role: "rowheader",
          "aria-label": "Roles",
        },
        {
          content: member.architecture,
          role: "rowheader",
          "aria-label": "Architecture",
        },
        {
          content: member.failure_domain,
          role: "rowheader",
          "aria-label": "Failure domain",
        },
        {
          content: member.description,
          role: "rowheader",
          "aria-label": "Description",
        },
        {
          content: member.status,
          role: "rowheader",
          "aria-label": "Status",
        },
        {
          content: member.message,
          role: "rowheader",
          "aria-label": "Message",
        },
        {
          content: <></>,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: member.server_name,
      },
    };
  });

  return (
    <>
      <div className="p-panel__header">
        <h4 className="p-panel__title">Cluster</h4>
      </div>
      <div className="p-panel__content">
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
            className="p-table--cluster"
          />
        </Row>
      </div>
    </>
  );
};

export default ClusterList;
