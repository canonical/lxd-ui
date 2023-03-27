import React, { FC, useEffect, useState } from "react";
import {
  Button,
  MainTable,
  SearchBox,
  usePagination,
} from "@canonical/react-components";
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
import { paginationOptions } from "util/paginationOptions";
import { updateTBodyHeight } from "util/updateTBodyHeight";

interface Props {
  instance: LxdInstance;
}

const InstanceSnapshots: FC<Props> = ({ instance }) => {
  const [query, setQuery] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [inTabNotification, setInTabNotification] =
    useState<Notification | null>(null);
  const [pageSize, setPageSize] = useState(paginationOptions[0].value);

  const onSuccess = (message: string) => {
    setInTabNotification(success(message));
  };

  const onFailure = (message: string, e: unknown) => {
    setInTabNotification(failure(message, e));
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
          content: snapshot.name,
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

  const {
    pageData: pageSnapshots,
    currentPage,
    paginate: setCurrentPage,
  } = usePagination(rows, {
    itemsPerPage: pageSize,
    autoResetPage: true,
  });

  useEventListener("resize", () =>
    updateTBodyHeight("snapshots-table-wrapper")
  );
  useEffect(() => {
    updateTBodyHeight("snapshots-table-wrapper");
  }, [instance.snapshots, inTabNotification, query, pageSize, currentPage]);

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
            rows={pageSnapshots}
            sortable
            className="snapshots-table"
            id="snapshots-table-wrapper"
            emptyStateMsg="No snapshot found matching this search"
          />
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalCount={instance.snapshots?.length ?? 0}
            totalPages={Math.ceil(filteredSnapshots.length / pageSize)}
            visibleCount={
              filteredSnapshots.length === instance.snapshots?.length
                ? pageSnapshots.length
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
