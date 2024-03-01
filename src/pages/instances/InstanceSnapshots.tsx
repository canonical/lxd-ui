import { ReactNode, useEffect, useState } from "react";
import {
  EmptyState,
  Icon,
  SearchBox,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { isoTimeToString } from "util/helpers";
import { LxdInstance } from "types/instance";
import InstanceSnapshotActions from "./actions/snapshots/InstanceSnapshotActions";
import useEventListener from "@use-it/event-listener";
import ItemName from "components/ItemName";
import SelectableMainTable from "components/SelectableMainTable";
import InstanceSnapshotBulkDelete from "pages/instances/actions/snapshots/InstanceSnapshotBulkDelete";
import Loader from "components/Loader";
import { useProject } from "context/project";
import ScrollableTable from "components/ScrollableTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import { useDocs } from "context/useDocs";
import InstanceConfigureSnapshotsBtn from "./actions/snapshots/InstanceConfigureSnapshotsBtn";
import InstanceAddSnapshotBtn from "./actions/snapshots/InstanceAddSnapshotBtn";
import { isSnapshotsDisabled } from "util/snapshots";
import useSortTableData from "util/useSortTableData";
import { useToastNotification } from "context/toastNotificationProvider";
import NotificationRow from "components/NotificationRow";

const collapsedViewMaxWidth = 1250;
export const figureCollapsedScreen = (): boolean =>
  window.innerWidth <= collapsedViewMaxWidth;

interface Props {
  instance: LxdInstance;
}

const InstanceSnapshots = (props: Props) => {
  const { instance } = props;
  const docBaseLink = useDocs();
  const [query, setQuery] = useState<string>("");
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingNames, setProcessingNames] = useState<string[]>([]);
  const [isSmallScreen, setSmallScreen] = useState(figureCollapsedScreen());

  const onSuccess = (message: ReactNode) => {
    toastNotify.success(message);
  };

  const onFailure = (title: string, e: unknown, message?: ReactNode) => {
    notify.failure(title, e, message);
  };

  const { project, isLoading } = useProject();

  const snapshotsDisabled = isSnapshotsDisabled(project);

  useEffect(() => {
    const validNames = new Set(
      instance.snapshots?.map((snapshot) => snapshot.name),
    );
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [instance.snapshots]);

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
    {
      content: isSmallScreen ? (
        <>
          Name
          <br />
          <div className="header-second-row">Date created</div>
        </>
      ) : (
        "Name"
      ),
      sortKey: isSmallScreen ? "created_at" : "name",
      className: "name",
    },
    ...(isSmallScreen
      ? []
      : [
          {
            content: "Date created",
            sortKey: "created_at",
            className: "created",
          },
        ]),
    {
      content: "Expiry date",
      sortKey: "expires_at",
      className: "expiration",
    },
    { content: "Stateful", sortKey: "stateful", className: "stateful" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = filteredSnapshots.map((snapshot) => {
    const actions = (
      <InstanceSnapshotActions
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
            <>
              <div className="u-truncate" title={`Snapshot ${snapshot.name}`}>
                <ItemName item={snapshot} />
              </div>
              {isSmallScreen && (
                <div className="u-text--muted">
                  {isoTimeToString(snapshot.created_at)}
                </div>
              )}
            </>
          ),
          role: "rowheader",
          "aria-label": "Name",
          className: "name",
        },
        ...(isSmallScreen
          ? []
          : [
              {
                content: isoTimeToString(snapshot.created_at),
                role: "rowheader",
                "aria-label": "Created at",
                className: "created",
              },
            ]),
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
        name: snapshot.name.toLowerCase(),
        created_at: snapshot.created_at,
        expires_at: snapshot.expires_at,
        stateful: snapshot.stateful,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
    defaultSort: "created_at",
    defaultSortDirection: "descending",
  });

  const resize = () => {
    setSmallScreen(figureCollapsedScreen());
  };
  useEventListener("resize", resize);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="snapshot-list">
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
              <InstanceConfigureSnapshotsBtn
                instance={instance}
                className="u-no-margin--right"
                onFailure={onFailure}
                onSuccess={onSuccess}
              />
              <InstanceAddSnapshotBtn
                instance={instance}
                onSuccess={onSuccess}
                onFailure={onFailure}
                className="u-float-right"
                isDisabled={snapshotsDisabled}
              />
            </>
          ) : (
            <div className="p-panel__controls">
              <InstanceSnapshotBulkDelete
                instance={instance}
                snapshotNames={selectedNames}
                onStart={() => setProcessingNames(selectedNames)}
                onFinish={() => setProcessingNames([])}
                onSuccess={onSuccess}
                onFailure={onFailure}
              />
            </div>
          )}
        </div>
      )}
      <NotificationRow />
      {hasSnapshots ? (
        <>
          <ScrollableTable
            dependencies={[filteredSnapshots, notify.notification]}
            tableId="instance-snapshot-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              data={sortedRows}
              id="pagination"
              itemName="snapshot"
              className="u-no-margin--top"
              aria-label="Table pagination control"
              description={
                selectedNames.length > 0 && (
                  <SelectedTableNotification
                    totalCount={instance.snapshots?.length ?? 0}
                    itemName="snapshot"
                    parentName="instance"
                    selectedNames={selectedNames}
                    setSelectedNames={setSelectedNames}
                    filteredNames={filteredSnapshots.map((item) => item.name)}
                  />
                )
              }
            >
              <SelectableMainTable
                id="instance-snapshot-table"
                headers={headers}
                rows={sortedRows}
                sortable
                emptyStateMsg="No snapshot found matching this search"
                itemName="snapshot"
                parentName="instance"
                selectedNames={selectedNames}
                setSelectedNames={setSelectedNames}
                processingNames={processingNames}
                filteredNames={filteredSnapshots.map(
                  (snapshot) => snapshot.name,
                )}
                onUpdateSort={updateSort}
                defaultSort="created_at"
                defaultSortDirection="descending"
              />
            </TablePagination>
          </ScrollableTable>
        </>
      ) : (
        <EmptyState
          className="empty-state"
          image={<Icon name="containers" className="empty-state-icon" />}
          title="No snapshots found"
        >
          <p>
            {project && snapshotsDisabled ? (
              <>
                Snapshots are disabled for project{" "}
                <ItemName item={project} bold />.
              </>
            ) : (
              "There are no snapshots of this instance."
            )}
          </p>
          <p>
            <a
              href={`${docBaseLink}/howto/storage_backup_volume/#storage-backup-snapshots`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about snapshots
              <Icon className="external-link-icon" name="external-link" />
            </a>
          </p>
          <InstanceConfigureSnapshotsBtn
            instance={instance}
            onFailure={onFailure}
            onSuccess={onSuccess}
            isDisabled={snapshotsDisabled}
          />
          <InstanceAddSnapshotBtn
            instance={instance}
            onSuccess={onSuccess}
            onFailure={onFailure}
            className="empty-state-button"
            isDisabled={snapshotsDisabled}
          />
        </EmptyState>
      )}
    </div>
  );
};

export default InstanceSnapshots;
