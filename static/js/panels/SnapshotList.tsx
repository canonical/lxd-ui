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
import CreateSnapshotForm from "../modals/CreateSnapshotForm";
import RestoreSnapshotBtn from "../buttons/snapshots/RestoreSnapshotBtn";
import NotificationRow from "../components/NotificationRow";
import { useQuery } from "@tanstack/react-query";
import { fetchSnapshots } from "../api/snapshots";
import Aside from "../components/Aside";
import PanelHeader from "../components/PanelHeader";
import useNotification from "../util/useNotification";
import usePanelParams from "../util/usePanelParams";

const SnapshotList: FC = () => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const notify = useNotification();
  const panelParams = usePanelParams();
  const [instanceName] = useState(panelParams.instance || "");

  const {
    data: snapshots = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.instances, instanceName, queryKeys.snapshots],
    queryFn: async () => fetchSnapshots(instanceName),
  });

  if (error) {
    notify.failure("Could not load snapshots", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Created at", sortKey: "created_at" },
    { content: "Expires at", sortKey: "expires_at" },
    { content: "Stateful", sortKey: "stateful", className: "u-align--center" },
    { content: "Actions", className: "u-align--center" },
  ];

  const rows = snapshots?.map((snapshot) => {
    const actions = (
      <div>
        <Tooltip message="Restore snapshot" position="btm-center">
          <RestoreSnapshotBtn
            instanceName={instanceName}
            snapshot={snapshot}
            notify={notify}
          />
        </Tooltip>
        <Tooltip message="Delete snapshot" position="btm-center">
          <DeleteSnapshotBtn
            instanceName={instanceName}
            snapshot={snapshot}
            notify={notify}
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
        created_at: snapshot.created_at,
        expires_at: snapshot.expires_at,
        stateful: snapshot.stateful,
      },
    };
  });

  return (
    <>
      <Aside width="wide">
        <div className="p-panel">
          <PanelHeader title={`Snapshots for ${instanceName}`} />
          <div className="p-panel__content">
            <NotificationRow notify={notify} />
            <Row>
              <MainTable
                headers={headers}
                rows={rows}
                paginate={30}
                responsive
                sortable
                className="p-table--snapshots"
              />
              {!isLoading && !snapshots.length && (
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
                  onClick={() => setCreateModalOpen(true)}
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
      {isCreateModalOpen && (
        <CreateSnapshotForm
          instanceName={instanceName}
          close={() => setCreateModalOpen(false)}
          notify={notify}
        />
      )}
    </>
  );
};

export default SnapshotList;
