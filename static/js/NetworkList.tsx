import React, { FC, useEffect, useState } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import { fetchNetworkList } from "./api/networks";
import { LxdNetwork } from "./types/network";
import { Notification } from "./types/notification";
import { useQueryParam, StringParam } from "use-query-params";
import BaseLayout from "./components/BaseLayout";
import { panelQueryParams } from "./util/panelQueryParams";

const NetworkList: FC = () => {
  const [networks, setNetworks] = useState<LxdNetwork[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);

  const setPanelQs = useQueryParam("panel", StringParam)[1];

  const setFailure = (message: string) => {
    setNotification({
      message,
      type: "negative",
    });
  };

  const loadNetworks = async () => {
    try {
      const networks = await fetchNetworkList();
      setNetworks(networks);
    } catch (e) {
      setFailure("Could not load networks.");
    }
  };

  useEffect(() => {
    loadNetworks();
  }, []);

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
      <BaseLayout
        title="Networks"
        controls={
          <button
            className="p-button--positive u-no-margin--bottom"
            onClick={() => setPanelQs(panelQueryParams.networkForm)}
          >
            Add network
          </button>
        }
      >
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
            className="p-table--networks"
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default NetworkList;
