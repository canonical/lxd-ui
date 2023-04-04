import React, { FC, ReactNode, useEffect, useState } from "react";
import { Button, MainTable, SearchBox } from "@canonical/react-components";
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
import ConfigureSnapshotsBtn from "pages/instances/actions/snapshots/ConfigureSnapshotsBtn";

interface Props {
  instance: LxdInstance;
}

const InstanceSnapshots: FC<Props> = ({ instance }) => {
  const [query, setQuery] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [inTabNotification, setInTabNotification] =
    useState<Notification | null>(null);

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
      content: "Expiration date",
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
        </div>
      )}
      <NotificationRowLegacy
        notification={inTabNotification}
        onDismiss={() => setInTabNotification(null)}
      />
      {hasSnapshots ? (
        <>
          <MainTable
            headers={headers}
            rows={pagination.pageData}
            sortable
            className="snapshots-table"
            id="snapshots-table-wrapper"
            emptyStateMsg="No snapshot found matching this search"
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
