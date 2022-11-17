import {
  Button,
  Col,
  Icon,
  MainTable,
  Row,
  Tooltip,
} from "@canonical/react-components";
import React, { FC, useState } from "react";
import { isoTimeToString } from "../util/helpers";
import { queryKeys } from "../util/queryKeys";
import DeleteSnapshotBtn from "../buttons/snapshots/DeleteSnapshotBtn";
import { Notification } from "../types/notification";
import CreateSnapshotForm from "../modals/CreateSnapshotForm";
import RestoreSnapshotBtn from "../buttons/snapshots/RestoreSnapshotBtn";
import NotificationRow from "../components/NotificationRow";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryParams, StringParam } from "use-query-params";
import { fetchSnapshots } from "../api/snapshots";
import Aside from "../components/Aside";
import PanelHeader from "../components/PanelHeader";

const SnapshotList: FC = () => {
  const [snapshotsLoaded, setSnapshotsLoaded] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isCreating, setCreating] = useState(false);
  const queryClient = useQueryClient();

  const queryParams = useQueryParams({
    instance: StringParam,
  });

  const [instanceName] = useState(queryParams[0].instance || "");

  const { data: snapshots = [], isError } = useQuery({
    queryKey: [queryKeys.instances, instanceName, queryKeys.snapshots],
    queryFn: async () =>
      fetchSnapshots(instanceName, () => setSnapshotsLoaded(true)),
  });

  const setFailure = (message: string) => {
    setNotification({
      message,
      type: "negative",
    });
  };

  if (isError) {
    setFailure("Could not load snapshots");
  }

  const onCreateSuccess = (snapshotName: string) => {
    setCreating(false);
    setNotification({
      message: `Snapshot ${snapshotName} created.`,
      type: "positive",
    });
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === queryKeys.instances,
    });
  };

  const onCreateError = (e: any) => {
    setCreating(false);
    setNotification({
      message: `Error on snapshot create. ${e.toString()}`,
      type: "negative",
    });
  };

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Created at" },
    { content: "Expires at" },
    { content: "Stateful", className: "u-align--center" },
    { content: "Actions", className: "u-align--center" },
  ];

  const rows = snapshots?.map((snapshot) => {
    const actions = (
      <div>
        <Tooltip message="Restore snapshot" position="btm-center">
          <RestoreSnapshotBtn
            instanceName={instanceName}
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
            }}
          />
        </Tooltip>
        <Tooltip message="Delete snapshot" position="btm-center">
          <DeleteSnapshotBtn
            instanceName={instanceName}
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
    <>
      <Aside width="wide">
        <div className="p-panel">
          <PanelHeader title={`Snapshots for ${instanceName}`} />
          <div className="p-panel__content">
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
                className="p-table--snapshots"
              />
              {snapshotsLoaded && !snapshots.length && (
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
                          point in time. It can be used to restore the instance
                          to that state. Create a new snapshot with the
                          &quot;Create snapshot&quot; button below.
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
              <hr />
            </Row>
            <Row className="u-align--right">
              <Col size={12}>
                <Button
                  onClick={() => setCreating(true)}
                  className="p-button has-icon"
                  appearance="positive"
                >
                  <i className="p-icon--plus is-light" />
                  <span>Create snapshot</span>
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      </Aside>
      {isCreating && (
        <CreateSnapshotForm
          instanceName={instanceName}
          onCreateSuccess={onCreateSuccess}
          onCreateError={onCreateError}
          onCancel={() => setCreating(false)}
        />
      )}
    </>
  );
};

export default SnapshotList;
