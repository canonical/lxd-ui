import React, { FC } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import { fetchClusterMembers } from "api/cluster";
import BaseLayout from "components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import Loader from "components/Loader";

const ClusterList: FC = () => {
  const notify = useNotify();

  const {
    data: members = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members],
    queryFn: fetchClusterMembers,
  });

  if (error) {
    notify.failure("Loading cluster members failed", error);
  }

  const headers = [
    { content: "Name" },
    { content: "Url", sortKey: "url" },
    { content: "Roles", sortKey: "roles" },
    { content: "Architecture", sortKey: "architecture" },
    { content: "Failure Domain", sortKey: "failureDomain" },
    { content: "Description", sortKey: "description" },
    { content: "State", sortKey: "state" },
    { content: "Message", sortKey: "message" },
    { "aria-label": "Actions", className: "u-align--right" },
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
          className: "u-align--right",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: member.server_name.toLowerCase(),
      },
    };
  });

  return (
    <>
      <BaseLayout title="Cluster">
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
                <Loader text="Loading cluster members..." />
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

export default ClusterList;
