import React, { FC } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import { fetchClusterMembers } from "./api/cluster";
import BaseLayout from "./components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./util/queryKeys";
import useNotification from "./util/useNotification";

const ClusterList: FC = () => {
  const notify = useNotification();

  const { data: members = [], error } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members],
    queryFn: fetchClusterMembers,
  });

  if (error) {
    notify.failure("Could not load cluster members.", error);
  }

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
      <BaseLayout title="Cluster">
        <NotificationRow notify={notify} />
        <Row>
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="u-table-layout--auto"
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default ClusterList;
