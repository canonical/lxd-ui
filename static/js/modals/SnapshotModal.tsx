import { Button, MainTable, Modal, Tooltip } from "@canonical/react-components";
import React, { FC, useState } from "react";
import { LxdInstance } from "../types/instance";
import { isoTimeToString } from "../helpers";
import DeleteSnapshotBtn from "../buttons/snapshots/DeleteSnapshotBtn";
import { Notification } from "../types/notification";
import NotificationRow from "../NotificationRow";
import { createSnapshot } from "../api/snapshots";
import CreateSnapshotForm from "../CreateSnapshotForm";
import RestoreSnapshotBtn from "../buttons/snapshots/RestoreSnapshotBtn";

type Props = {
  onCancel: () => void;
  onChange: () => void;
  instance: LxdInstance;
};

const SnapshotModal: FC<Props> = ({ onCancel, instance, onChange }: Props) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isCreating, setCreating] = useState(false);

  const handleCreate = (
    instance: LxdInstance,
    snapshotName: string,
    expiresAt: string | null,
    stateful: boolean
  ) => {
    createSnapshot(instance, snapshotName, expiresAt, stateful)
      .then(() => {
        setCreating(false);
        setNotification({
          message: `Snapshot ${snapshotName} created.`,
          type: "positive",
        });
        onChange();
      })
      .catch((e) => {
        setCreating(false);
        console.log(e, e.toString());
        setNotification({
          message: `Error on snapshot create. ${e.toString()}`,
          type: "negative",
        });
      });
  };

  if (isCreating) {
    return (
      <CreateSnapshotForm
        instance={instance}
        onSuccess={handleCreate}
        onCancel={() => setCreating(false)}
      />
    );
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Created at" },
    { content: "Expires at" },
    { content: "Stateful", className: "u-align--center" },
    { content: "Actions", className: "u-align--center" },
  ];

  const rows = instance.snapshots?.map((snapshot) => {
    const actions = (
      <div>
        <Tooltip message="Restore snapshot" position="btm-center">
          <RestoreSnapshotBtn
            instance={instance}
            snapshot={snapshot}
            onFailure={() =>
              setNotification({
                message: "Error on snapshot restore.",
                type: "negative",
              })
            }
            onSuccess={() => {
              setNotification({
                message: `Snapshot restored.`,
                type: "positive",
              });
              onChange();
            }}
          />
        </Tooltip>
        <Tooltip message="Delete snapshot" position="btm-center">
          <DeleteSnapshotBtn
            instance={instance}
            snapshot={snapshot}
            onFailure={() =>
              setNotification({
                message: "Error on snapshot delete.",
                type: "negative",
              })
            }
            onSuccess={() => {
              setNotification({
                message: `Snapshot deleted.`,
                type: "positive",
              });
              onChange();
            }}
          />
        </Tooltip>
      </div>
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
      },
    };
  });

  return (
    <Modal
      close={onCancel}
      title={`Snapshots for ${instance.name}`}
      buttonRow={
        <>
          <Button
            onClick={() => setCreating(true)}
            className="p-button has-icon"
            appearance="positive"
          >
            <i className="p-icon--plus is-light" />
            <span>Create snapshot</span>
          </Button>
          <Button className="u-no-margin--bottom" onClick={onCancel}>
            Close
          </Button>
        </>
      }
    >
      <NotificationRow
        notification={notification}
        close={() => setNotification(null)}
      />
      {instance.snapshots ? (
        <MainTable
          headers={headers}
          rows={rows}
          paginate={30}
          responsive
          sortable
          className="p-table--snapshots"
        />
      ) : (
        <p>No snapshots found</p>
      )}
    </Modal>
  );
};

export default SnapshotModal;
