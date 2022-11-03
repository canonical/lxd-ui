import { MainTable, Row, Tooltip } from "@canonical/react-components";
import React, { FC, useEffect, useState } from "react";
import { fetchInstances } from "./api/instances";
import BaseLayout from "./components/BaseLayout";
import DeleteInstanceBtn from "./buttons/instances/DeleteInstanceBtn";
import OpenTerminalBtn from "./buttons/instances/OpenTerminalBtn";
import StartInstanceBtn from "./buttons/instances/StartInstanceBtn";
import StopInstanceBtn from "./buttons/instances/StopInstanceBtn";
import NotificationRow from "./components/NotificationRow";
import OpenVgaBtn from "./buttons/instances/OpenVgaBtn";
import { LxdInstance } from "./types/instance";
import { Notification } from "./types/notification";
import SnapshotModal from "./modals/SnapshotModal";

import { StringParam, useQueryParam } from "use-query-params";
import Panels from "./panels/panels";
import { panelQueryParams } from "./panels/queryparams";

const InstanceList: FC = () => {
  const [instances, setInstances] = useState<LxdInstance[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [snapshotInstanceName, setSnapshotInstanceName] = useState("");

  const setPanelQs = useQueryParam("panel", StringParam)[1];

  const setFailure = (message: string) => {
    setNotification({
      message,
      type: "negative",
    });
  };

  const loadInstances = async () => {
    try {
      const instances = await fetchInstances();
      setInstances(instances);
    } catch (e) {
      setFailure("Could not load instances");
    }
  };

  useEffect(() => {
    loadInstances();
    let timer = setInterval(loadInstances, 5000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "State", sortKey: "state", className: "u-align--center" },
    { content: "IPv4" },
    { content: "IPv6" },
    { content: "Type", sortKey: "type", className: "u-align--center" },
    {
      content: "Snapshots",
      sortKey: "snapshots",
      className: "u-align--center",
    },
    { content: "Actions", className: "u-align--center" },
  ];

  // todo: which states are used - can error/unknown/init be removed?
  const getIconClassForStatus = (status: string) => {
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
        <i className={getIconClassForStatus(instance.status)}></i>
        {instance.status}
      </>
    );

    const actions = (
      <div>
        <Tooltip message="Start instance" position="btm-center">
          <StartInstanceBtn
            instance={instance}
            onSuccess={loadInstances}
            onFailure={setFailure}
          />
        </Tooltip>
        <Tooltip message="Stop instance" position="btm-center">
          <StopInstanceBtn
            instance={instance}
            onSuccess={loadInstances}
            onFailure={setFailure}
          />
        </Tooltip>
        <Tooltip message="Delete instance" position="btm-center">
          <DeleteInstanceBtn
            instance={instance}
            onSuccess={loadInstances}
            onFailure={setFailure}
          />
        </Tooltip>
        <Tooltip message="Start console" position="btm-center">
          <OpenTerminalBtn instance={instance} />
        </Tooltip>
        <Tooltip message="Start VGA session" position="btm-center">
          <OpenVgaBtn instance={instance} />
        </Tooltip>
      </div>
    );

    const snapshots = (
      <button
        onClick={() => setSnapshotInstanceName(instance.name)}
        className="p-button--base has-icon"
      >
        <span>{instance.snapshots?.length || "0"}</span>
        <i className="p-icon--settings">snapshots</i>
      </button>
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
          className: "u-align--center",
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
          className: "u-align--center",
          "aria-label": "Type",
        },
        {
          content: snapshots,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Snapshots",
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
        snapshots: instance.snapshots?.length || 0,
      },
    };
  });

  return (
    <>
      <BaseLayout
        title="Instances"
        controls={
          <button
            className="p-button--positive u-no-margin--bottom"
            onClick={() => setPanelQs(panelQueryParams.instanceForm)}
          >
            Add instance
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
            className="p-table--instances"
          />
        </Row>
        {snapshotInstanceName && (
          <SnapshotModal
            onCancel={() => setSnapshotInstanceName("")}
            onChange={loadInstances}
            instance={
              instances.filter((item) => item.name === snapshotInstanceName)[0]
            }
          />
        )}
      </BaseLayout>
      <Panels />
    </>
  );
};

export default InstanceList;
