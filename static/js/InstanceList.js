import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainTable, Tooltip } from "@canonical/react-components";
import {
  deleteInstance,
  fetchInstances,
  startInstance,
  stopInstance,
} from "./api/instances";

function InstanceList() {
  const [instances, setInstances] = useState([]);

  const loadInstances = () => fetchInstances().then(setInstances);
  useEffect(() => {
    loadInstances();
    let timer = setInterval(loadInstances, 5000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "State", sortKey: "state" },
    { content: "IPv4" },
    { content: "IPv6" },
    { content: "Type", sortKey: "type" },
    { content: "Snapshots" },
    { content: "Actions", className: "u-align--center" },
  ];

  // todo: which states are used - can error/unknown/init be removed?
  const getIconClassForStatus = (status) => {
    return {
      error: "p-icon--oval-red",
      unknown: "p-icon--oval-yellow",
      initializing: "p-icon--spinner u-animation--spin",
      Running: "p-icon--oval-green",
      Stopped: "p-icon--oval-grey",
    }[status];
  };

  const rows = instances.map((instance) => {
    const status = (
      <>
        <i className={getIconClassForStatus(instance.status)} />
        {instance.status}
      </>
    );

    const actions = (
      <div>
        <Tooltip message="Start instance" position="left">
          <button
            onClick={() => startInstance(instance).then(loadInstances)}
            className="is-dense"
            disabled={instance.status !== "Stopped"}
          >
            <i className="p-icon--video-play">Start</i>
          </button>
        </Tooltip>
        <Tooltip message="Stop instance" position="left">
          <button
            onClick={() => stopInstance(instance).then(loadInstances)}
            className="is-dense"
            disabled={instance.status !== "Running"}
          >
            <i className="p-icon--power-off">Stop</i>
          </button>
        </Tooltip>
        <Tooltip message="Delete instance" position="left">
          <button
            onClick={() => deleteInstance(instance).then(loadInstances)}
            className="is-dense"
            disabled={instance.status !== "Stopped"}
          >
            <i className="p-icon--delete">Delete</i>
          </button>
        </Tooltip>
      </div>
    );

    return {
      columns: [
        {
          content: instance.name,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: status,
          role: "rowheader",
          "aria-label": "Status",
        },
        {
          content: instance.state?.network?.eth0?.addresses
            .filter((item) => item.family === "inet")
            .map((item) => item.address)
            .join(" "),
          role: "rowheader",
          "aria-label": "IPv4",
        },
        {
          content: instance.state?.network?.eth0?.addresses
            .filter((item) => item.family === "inet6")
            .map((item) => item.address)
            .join(" "),
          role: "rowheader",
          "aria-label": "IPv6",
        },
        {
          content: instance.type,
          role: "rowheader",
          "aria-label": "Type",
        },
        {
          content: "snapshots todo",
          role: "rowheader",
          "aria-label": "Type",
        },
        {
          content: actions,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: instance.name,
        state: instance.status,
        type: instance.type,
      },
    };
  });

  return (
    <>
      <div className="p-panel__header">
        <h4 className="p-panel__title">Instances</h4>
        <div className="p-panel__controls">
          <Link
            className="p-button--positive u-no-margin--bottom"
            to="/instances/add"
          >
            Add instance
          </Link>
        </div>
      </div>
      <div className="p-panel__content">
        <MainTable
          headers={headers}
          rows={rows}
          paginate={30}
          responsive
          sortable
        />
      </div>
    </>
  );
}

export default InstanceList;
