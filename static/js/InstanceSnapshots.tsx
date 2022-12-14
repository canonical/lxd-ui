import { Col, Icon, MainTable, Row } from "@canonical/react-components";
import React, { FC } from "react";
import { isoTimeToString } from "./util/helpers";
import { queryKeys } from "./util/queryKeys";
import DeleteSnapshotBtn from "./buttons/snapshots/DeleteSnapshotBtn";
import RestoreSnapshotBtn from "./buttons/snapshots/RestoreSnapshotBtn";
import NotificationRow from "./components/NotificationRow";
import { useQuery } from "@tanstack/react-query";
import useNotification from "./util/useNotification";
import { fetchInstance } from "./api/instances";
import { createPortal } from "react-dom";
import OpenInstanceListBtn from "./buttons/instances/OpenInstanceListBtn";
import CreateSnapshotBtn from "./buttons/instances/CreateSnapshotBtn";

interface Props {
  controlTarget?: HTMLSpanElement | null;
  instanceName: string;
}

const InstanceSnapshots: FC<Props> = ({ controlTarget, instanceName }) => {
  const notify = useNotification();

  const {
    data: instance,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances, instanceName],
    queryFn: async () => fetchInstance(instanceName),
  });

  if (error) {
    notify.failure("Could not load snapshots", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Created at", sortKey: "created_at" },
    { content: "Expires at", sortKey: "expires_at" },
    { content: "Stateful", sortKey: "stateful", className: "u-align--center" },
    { content: "" },
  ];

  const rows = instance?.snapshots?.map((snapshot) => {
    const actions = (
      <>
        <RestoreSnapshotBtn
          instanceName={instanceName}
          snapshot={snapshot}
          notify={notify}
        />
        <DeleteSnapshotBtn
          instanceName={instanceName}
          snapshot={snapshot}
          notify={notify}
        />
      </>
    );

    return {
      columns: [
        {
          content: snapshot.name,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: isoTimeToString(snapshot.created_at),
          role: "rowheader",
          "aria-label": "Created at",
        },
        {
          content: isoTimeToString(snapshot.expires_at),
          role: "rowheader",
          "aria-label": "Expires at",
        },
        {
          content: snapshot.stateful ? "Yes" : "No",
          role: "rowheader",
          "aria-label": "Stateful",
          className: "u-align--center",
        },
        {
          content: actions,
          role: "rowheader",
          "aria-label": "Actions",
          className: "u-align--center",
        },
      ],
      sortData: {
        name: snapshot.name,
        created_at: snapshot.created_at,
        expires_at: snapshot.expires_at,
        stateful: snapshot.stateful,
      },
    };
  });

  return (
    <>
      <NotificationRow notify={notify} />
      {controlTarget &&
        instance &&
        createPortal(
          <>
            <CreateSnapshotBtn instance={instance} notify={notify} />
            <OpenInstanceListBtn />
          </>,
          controlTarget
        )}
      <Row>
        {instance?.snapshots?.length && (
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="u-table-layout--auto"
          />
        )}
        {!isLoading && !instance?.snapshots?.length && (
          <Row className="empty-state-message">
            <Col size={2} />
            <Col size={8}>
              <Row>
                <Col size={2}>
                  <Icon name="settings" className="u-hide--small icon" />
                </Col>
                <Col size={6}>
                  <h4 className="p-heading--2">No snapshots found</h4>
                  <p>
                    A snapshot is the state of an instance at a particular point
                    in time. It can be used to restore the instance to that
                    state. Create a new snapshot with the &quot;Create
                    snapshot&quot; button above.
                  </p>
                  <p>
                    <a
                      className="p-link--external"
                      href="https://linuxcontainers.org/lxd/docs/latest/howto/storage_backup_volume/#storage-backup-snapshots"
                    >
                      Read the documentation on snapshots
                    </a>
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
      </Row>
    </>
  );
};

export default InstanceSnapshots;
