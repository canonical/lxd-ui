import { MainTable, Row, Tooltip } from "@canonical/react-components";
import React, { FC } from "react";
import { fetchInstances } from "./api/instances";
import BaseLayout from "./components/BaseLayout";
import DeleteInstanceBtn from "./buttons/instances/DeleteInstanceBtn";
import OpenTerminalBtn from "./buttons/instances/OpenTerminalBtn";
import StartInstanceBtn from "./buttons/instances/StartInstanceBtn";
import StopInstanceBtn from "./buttons/instances/StopInstanceBtn";
import NotificationRow from "./components/NotificationRow";
import OpenVgaBtn from "./buttons/instances/OpenVgaBtn";
import {
  StringParam,
  useQueryParam,
  useQueryParams,
  withDefault,
} from "use-query-params";
import { panelQueryParams } from "./util/panelQueryParams";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./util/queryKeys";
import useNotification from "./util/useNotification";

const InstanceList: FC = () => {
  const notify = useNotification();

  const setPanelQs = useQueryParam("panel", StringParam)[1];
  const setSnapshotPanelQs = useQueryParams({
    instance: StringParam,
    panel: withDefault(StringParam, panelQueryParams.snapshots),
  })[1];

  const { data: instances = [], error } = useQuery({
    queryKey: [queryKeys.instances],
    queryFn: fetchInstances,
  });

  if (error) {
    notify.failure("Could not load instances.", error);
  }

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
        <i className={getIconClassForStatus(instance.status)}></i>{" "}
        {instance.status}
      </>
    );

    const actions = (
      <div>
        <Tooltip message="Start instance" position="btm-center">
          <StartInstanceBtn instance={instance} notify={notify} />
        </Tooltip>
        <Tooltip message="Stop instance" position="btm-center">
          <StopInstanceBtn instance={instance} notify={notify} />
        </Tooltip>
        <Tooltip message="Delete instance" position="btm-center">
          <DeleteInstanceBtn instance={instance} notify={notify} />
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
        onClick={() => {
          setSnapshotPanelQs({
            panel: panelQueryParams.snapshots,
            instance: instance.name,
          });
        }}
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
        <NotificationRow notify={notify} />
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
      </BaseLayout>
    </>
  );
};

export default InstanceList;
