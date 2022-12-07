import {
  Button,
  ContextualMenu,
  MainTable,
  Row,
} from "@canonical/react-components";
import React, { FC } from "react";
import { fetchInstances } from "./api/instances";
import BaseLayout from "./components/BaseLayout";
import DeleteInstanceBtn from "./buttons/instances/DeleteInstanceBtn";
import OpenTerminalBtn from "./buttons/instances/OpenTerminalBtn";
import StartInstanceBtn from "./buttons/instances/StartInstanceBtn";
import StopInstanceBtn from "./buttons/instances/StopInstanceBtn";
import NotificationRow from "./components/NotificationRow";
import OpenVgaBtn from "./buttons/instances/OpenVgaBtn";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./util/queryKeys";
import useNotification from "./util/useNotification";
import usePanelParams from "./util/usePanelParams";

const InstanceList: FC = () => {
  const notify = useNotification();
  const panelParams = usePanelParams();

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
    { content: "" },
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
      <ContextualMenu
        key={`actions-${instance.name}`}
        hasToggleIcon
        links={[
          {
            children: <StartInstanceBtn instance={instance} notify={notify} />,
          },
          {
            children: <StopInstanceBtn instance={instance} notify={notify} />,
          },
          {
            children: <DeleteInstanceBtn instance={instance} notify={notify} />,
          },
          {
            children: <OpenTerminalBtn instance={instance} />,
          },
          {
            children: <OpenVgaBtn instance={instance} />,
          },
        ]}
        position="right"
        toggleAppearance="base"
        toggleLabel="Actions"
      />
    );

    const snapshots = (
      <Button
        appearance="base"
        hasIcon
        onClick={() => {
          panelParams.openSnapshots(instance.name);
        }}
      >
        <span>{instance.snapshots?.length ?? "0"}</span>
        <i className="p-icon--settings">snapshots</i>
      </Button>
    );

    return {
      columns: [
        {
          content: <a href={`/instances/${instance.name}`}>{instance.name}</a>,
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
        snapshots: instance.snapshots?.length ?? 0,
      },
    };
  });

  return (
    <>
      <BaseLayout
        title="Instances"
        controls={
          <ContextualMenu
            hasToggleIcon
            links={[
              {
                children: "Quick create instance",
                onClick: () => panelParams.openInstanceFormGuided(),
              },
              {
                children: "Custom create instance (YAML)",
                onClick: () => panelParams.openInstanceFormYaml(),
              },
            ]}
            position="right"
            toggleAppearance="positive"
            toggleLabel="Add instance"
          />
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
            className="u-table-layout--auto"
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default InstanceList;
