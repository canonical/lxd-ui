import React, { FC } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import { fetchNetworks } from "./api/networks";
import BaseLayout from "./components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./util/queryKeys";
import useNotification from "./util/useNotification";

const NetworkList: FC = () => {
  const notify = useNotification();

  const { data: networks = [], error } = useQuery({
    queryKey: [queryKeys.networks],
    queryFn: fetchNetworks,
  });

  if (error) {
    notify.failure("Could not load networks.", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Type", sortKey: "type" },
    { content: "Managed", sortKey: "managed", className: "u-align--center" },
    { content: "IPV4" },
    { content: "IPV6" },
    { content: "Description", sortKey: "description" },
    { content: "Used by", sortKey: "usedBy", className: "u-align--center" },
    { content: "State", sortKey: "state" },
    { content: "Actions", className: "u-align--center" },
  ];

  const rows = networks.map((network) => {
    return {
      columns: [
        {
          content: network.name,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: network.type,
          role: "rowheader",
          "aria-label": "Type",
        },
        {
          content: network.managed ? "Yes" : "No",
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Managed",
        },
        {
          content: network.config["ipv4.address"],
          role: "rowheader",
          "aria-label": "IPV4",
        },
        {
          content: network.config["ipv6.address"],
          role: "rowheader",
          "aria-label": "IPV6",
        },
        {
          content: network.description,
          role: "rowheader",
          "aria-label": "Description",
        },
        {
          content: network.used_by?.length || "0",
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Used by",
        },
        {
          content: network.status,
          role: "rowheader",
          "aria-label": "State",
        },
        {
          content: <></>,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: network.name,
        type: network.type,
        managed: network.managed,
        description: network.description,
        state: network.status,
        usedBy: network.used_by?.length || 0,
      },
    };
  });

  return (
    <>
      <BaseLayout title="Networks">
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

export default NetworkList;
