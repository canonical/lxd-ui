import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainTable } from "@canonical/react-components";
import NotificationRow, { Notification } from "./NotificationRow";
import { fetchNetworkList, LxdNetwork } from "./api/networks";

function NetworkList() {
  const [networks, setNetworks] = useState<LxdNetwork[]>([]);
  const [notification, setNotification] = useState<Notification>(null);

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
      <div className="p-panel__header">
        <h4 className="p-panel__title">Networks</h4>
        <div className="p-panel__controls">
          <Link
            className="p-button--positive u-no-margin--bottom"
            to="/networks/add"
          >
            Add network
          </Link>
        </div>
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
          className="p-table--networks"
        />
      </div>
    </>
  );
}

export default NetworkList;
