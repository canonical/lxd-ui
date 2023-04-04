import React, { FC, ReactNode, useEffect, useState } from "react";
import { Button, Icon, SearchBox } from "@canonical/react-components";
import { isoTimeToString } from "util/helpers";
import { LxdInstance } from "types/instance";
import EmptyState from "components/EmptyState";
import CreateSnapshotForm from "pages/instances/actions/snapshots/CreateSnapshotForm";
import NotificationRowLegacy from "components/NotificationRowLegacy";
import { Notification } from "types/notification";
import { failure, success } from "context/notify";
import SnapshotActions from "./actions/snapshots/SnapshotActions";
import useEventListener from "@use-it/event-listener";
import Pagination from "components/Pagination";
import { usePagination } from "util/pagination";
import { updateTBodyHeight } from "util/updateTBodyHeight";
import ItemName from "components/ItemName";
import SelectableMainTable from "components/SelectableMainTable";
import SnapshotBulkDelete from "pages/instances/actions/snapshots/SnapshotBulkDelete";
import ConfigureSnapshotsBtn from "pages/instances/actions/snapshots/ConfigureSnapshotsBtn";

interface Props {
  instance: LxdInstance;
}

const InstanceSnapshots: FC<Props> = ({ instance }) => {
  const [query, setQuery] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [inTabNotification, setInTabNotification] =
    useState<Notification | null>(null);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingNames, setProcessingNames] = useState<string[]>([]);

  useEffect(() => {
    const validNames = new Set(
      instance.snapshots?.map((snapshot) => snapshot.name)
    );
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name)
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [instance.snapshots]);

  const onSuccess = (message: ReactNode) => {
    setInTabNotification(success(message));
  };

  const onFailure = (title: string, e: unknown) => {
    setInTabNotification(failure(title, e));
  };

  const filteredSnapshots =
    instance.snapshots?.filter((item) => {
      if (query) {
        if (!item.name.toLowerCase().includes(query.toLowerCase())) {
          return false;
        }
      }
      return true;
    }) ?? [];

  const hasSnapshots = instance.snapshots && instance.snapshots.length > 0;

  const headers = [
    { content: "Name", sortKey: "name", className: "name" },
    { content: "Date created", sortKey: "created_at", className: "created" },
    {
      content: "Expiry date",
      sortKey: "expires_at",
      className: "expiration",
    },
    { content: "Stateful", sortKey: "stateful", className: "stateful" },
    { content: "", className: "actions" },
  ];

  const rows = filteredSnapshots.map((snapshot) => {
    const actions = (
      <SnapshotActions
        instance={instance}
        snapshot={snapshot}
        onSuccess={onSuccess}
        onFailure={onFailure}
      />
    );

    return {
      className: "u-row",
      name: snapshot.name,
      columns: [
        {
          content: (
            <div className="u-truncate" title={snapshot.name}>
              <ItemName item={snapshot} />
            </div>
          ),
          role: "rowheader",
          "aria-label": "Name",
          className: "name",
        },
        {
          content: isoTimeToString(snapshot.created_at),
          role: "rowheader",
          "aria-label": "Created at",
          className: "created",
        },
        {
          content: isoTimeToString(snapshot.expires_at),
          role: "rowheader",
          "aria-label": "Expires at",
          className: "expiration",
        },
        {
          content: snapshot.stateful ? "Yes" : "No",
          role: "rowheader",
          "aria-label": "Stateful",
          className: "stateful",
        },
        {
          content: actions,
          role: "rowheader",
          "aria-label": "Actions",
          className: "u-align--right actions",
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

  const pagination = usePagination(rows);

  useEventListener("resize", () =>
    updateTBodyHeight("snapshots-table-wrapper")
  );
  useEffect(() => {
    updateTBodyHeight("snapshots-table-wrapper");
  }, [
    instance.snapshots,
    inTabNotification,
    query,
    pagination.pageSize,
    pagination.currentPage,
  ]);

  return (
    <div className="snapshot-list">
      {isModalOpen && (
        <CreateSnapshotForm
          instance={instance}
          close={() => setModalOpen(false)}
          onSuccess={onSuccess}
        />
      )}
      {hasSnapshots && (
        <div className="upper-controls-bar">
          {selectedNames.length === 0 ? (
            <>
              <div className="search-box-wrapper">
                <SearchBox
                  name="search-snapshot"
                  className="search-box margin-right"
                  type="text"
                  onChange={(value) => {
                    setQuery(value);
                  }}
                  placeholder="Search for snapshots"
                  value={query}
                  aria-label="Search for snapshots"
                />
              </div>
              <ConfigureSnapshotsBtn instance={instance} />
              <Button
                appearance="positive"
                className="u-float-right"
                onClick={() => setModalOpen(true)}
              >
                Create snapshot
              </Button>
            </>
          ) : (
            <>
              <SnapshotBulkDelete
                instance={instance}
                snapshotNames={selectedNames}
                onStart={() => setProcessingNames(selectedNames)}
                onFinish={() => setProcessingNames([])}
                onSuccess={onSuccess}
                onFailure={onFailure}
              />
              <Button
                appearance="link"
                className="u-no-padding--top"
                hasIcon
                onClick={() => setSelectedNames([])}
              >
                <span>Clear selection</span>
                <Icon name="close" className="clear-selection-icon" />
              </Button>
            </>
          )}
        </div>
      )}
      <NotificationRowLegacy
        notification={inTabNotification}
        onDismiss={() => setInTabNotification(null)}
      />
      {hasSnapshots ? (
        <>
          <SelectableMainTable
            headers={headers}
            rows={pagination.pageData}
            sortable
            className="snapshots-table"
            id="snapshots-table-wrapper"
            emptyStateMsg="No snapshot found matching this search"
            itemName="snapshot"
            parentName="instance"
            selectedNames={selectedNames}
            setSelectedNames={setSelectedNames}
            processingNames={processingNames}
            allNames={
              instance.snapshots?.map((snapshot) => snapshot.name) ?? []
            }
          />
          <Pagination
            {...pagination}
            totalCount={instance.snapshots?.length ?? 0}
            visibleCount={
              filteredSnapshots.length === instance.snapshots?.length
                ? pagination.pageData.length
                : filteredSnapshots.length
            }
            keyword="snapshot"
          />
        </>
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
    </div>
  );
};

export default InstanceSnapshots;
