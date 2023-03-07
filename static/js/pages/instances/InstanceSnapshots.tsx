import React, { FC, useState } from "react";
import { MainTable, Row } from "@canonical/react-components";
import { isoTimeToString } from "util/helpers";
import DeleteSnapshotBtn from "./actions/snapshots/DeleteSnapshotBtn";
import RestoreSnapshotBtn from "./actions/snapshots/RestoreSnapshotBtn";
import { createPortal } from "react-dom";
import CreateSnapshotBtn from "./actions/snapshots/CreateSnapshotBtn";
import { NotificationHelper } from "types/notification";
import { LxdInstance } from "types/instance";
import EmptyState from "components/EmptyState";
import CreateSnapshotForm from "pages/instances/actions/snapshots/CreateSnapshotForm";

interface Props {
  controlTarget?: HTMLSpanElement | null;
  instance: LxdInstance;
  notify: NotificationHelper;
}

const InstanceSnapshots: FC<Props> = ({ controlTarget, instance, notify }) => {
  const [isModalOpen, setModalOpen] = useState(false);

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
          instance={instance}
          snapshot={snapshot}
          notify={notify}
        />
        <DeleteSnapshotBtn
          instance={instance}
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
            <CreateSnapshotBtn openSnapshotForm={() => setModalOpen(true)} />
          </>,
          controlTarget
        )}
      {isModalOpen && (
        <CreateSnapshotForm
          instance={instance}
          close={() => setModalOpen(false)}
          notify={notify}
        />
      )}
      <Row>
        {instance.snapshots && instance.snapshots.length > 0 ? (
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="u-table-layout--auto"
          />
        ) : (
          <EmptyState
            iconName="settings"
            iconClass="p-empty-snapshots"
            title="No snapshots found"
            message="A snapshot is the state of an instance at a particular point
                  in time. It can be used to restore the instance to that state."
            linkMessage="Read the documentation on snapshots"
            linkURL="https://linuxcontainers.org/lxd/docs/latest/howto/storage_backup_volume/#storage-backup-snapshots"
            buttonLabel="Create snapshot"
            buttonAction={() => setModalOpen(true)}
          />
        )}
      </Row>
    </>
  );
};

export default InstanceSnapshots;
