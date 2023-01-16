import React, { FC } from "react";
import { Col, Icon, MainTable, Row } from "@canonical/react-components";
import { isoTimeToString } from "util/helpers";
import DeleteSnapshotBtn from "./actions/snapshots/DeleteSnapshotBtn";
import RestoreSnapshotBtn from "./actions/snapshots/RestoreSnapshotBtn";
import { createPortal } from "react-dom";
import CreateSnapshotBtn from "./actions/snapshots/CreateSnapshotBtn";
import { NotificationHelper } from "types/notification";
import { LxdInstance } from "types/instance";

interface Props {
  controlTarget?: HTMLSpanElement | null;
  instance: LxdInstance;
  notify: NotificationHelper;
}

const InstanceSnapshots: FC<Props> = ({ controlTarget, instance, notify }) => {
  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Created at", sortKey: "created_at" },
    { content: "Expires at", sortKey: "expires_at" },
    { content: "Stateful", sortKey: "stateful", className: "u-align--center" },
    { content: "" },
  ];

  const rows = instance.snapshots?.map((snapshot) => {
    const actions = (
      <>
        <RestoreSnapshotBtn
          instanceName={instance.name}
          snapshot={snapshot}
          notify={notify}
        />
        <DeleteSnapshotBtn
          instanceName={instance.name}
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
      {controlTarget &&
        createPortal(
          <>
            <CreateSnapshotBtn instance={instance} notify={notify} />
          </>,
          controlTarget
        )}
      <Row>
        <MainTable
          headers={headers}
          rows={rows}
          paginate={30}
          responsive
          sortable
          className="u-table-layout--auto"
          emptyStateMsg={
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
                      A snapshot is the state of an instance at a particular
                      point in time. It can be used to restore the instance to
                      that state. Create a new snapshot with the &quot;Create
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
          }
        />
      </Row>
    </>
  );
};

export default InstanceSnapshots;
