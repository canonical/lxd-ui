import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  EmptyState,
  Icon,
  ScrollableTable,
  SearchBox,
  TablePagination,
  useListener,
  useNotify,
  Spinner,
} from "@canonical/react-components";
import { isoTimeToString } from "util/helpers";
import VolumeSnapshotActions from "./actions/snapshots/VolumeSnapshotActions";
import ItemName from "components/ItemName";
import SelectableMainTable from "components/SelectableMainTable";
import { useCurrentProject } from "context/useCurrentProject";
import SelectedTableNotification from "components/SelectedTableNotification";
import { useDocs } from "context/useDocs";
import type { LxdStorageVolume } from "types/storage";
import VolumeSnapshotBulkDelete from "./actions/snapshots/VolumeSnapshotBulkDelete";
import VolumeAddSnapshotBtn from "./actions/snapshots/VolumeAddSnapshotBtn";
import VolumeConfigureSnapshotBtn from "./actions/snapshots/VolumeConfigureSnapshotBtn";
import { fetchStorageVolumeSnapshots } from "api/volume-snapshots";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { isSnapshotsDisabled } from "util/snapshots";
import { figureCollapsedScreen } from "util/storageVolume";
import useSortTableData from "util/useSortTableData";
import ResourceLink from "components/ResourceLink";

interface Props {
  volume: LxdStorageVolume;
}

const StorageVolumeSnapshots: FC<Props> = ({ volume }) => {
  const docBaseLink = useDocs();
  const [query, setQuery] = useState<string>("");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingNames, setProcessingNames] = useState<string[]>([]);
  const [isSmallScreen, setSmallScreen] = useState(figureCollapsedScreen());
  const notify = useNotify();
  const { project, isLoading: isProjectLoading } = useCurrentProject();

  const {
    data: volumeSnapshots,
    error,
    isLoading: isSnapshotsLoading,
  } = useQuery({
    queryKey: [
      queryKeys.storage,
      queryKeys.snapshots,
      volume.pool,
      volume.project,
      volume.type,
      volume.name,
      volume.location,
    ],
    queryFn: async () => fetchStorageVolumeSnapshots(volume),
  });

  const snapshotsDisabled = isSnapshotsDisabled(project);

  useEffect(() => {
    const validNames = new Set(
      volumeSnapshots?.map((snapshot) => snapshot.name),
    );
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [volumeSnapshots, selectedNames]);

  const filteredSnapshots =
    volumeSnapshots?.filter((item) => {
      if (query) {
        if (!item.name.toLowerCase().includes(query.toLowerCase())) {
          return false;
        }
      }
      return true;
    }) ?? [];

  const hasSnapshots = volumeSnapshots && volumeSnapshots.length > 0;

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
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = filteredSnapshots.map((snapshot) => {
    const actions = (
      <VolumeSnapshotActions volume={volume} snapshot={snapshot} />
    );

    return {
      key: snapshot.name,
      className: "u-row",
      name: snapshot.name,
      columns: [
        {
          content: (
            <>
              <div className="u-truncate" title={snapshot.name}>
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
                role: "cell",
                "aria-label": "Created at",
                className: "created",
              },
            ]),
        {
          content: isoTimeToString(snapshot.expires_at ?? ""),
          role: "cell",
          "aria-label": "Expires at",
          className: "expiration",
        },
        {
          content: actions,
          role: "cell",
          "aria-label": "Actions",
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: snapshot.name.toLowerCase(),
        created_at: snapshot.created_at,
        expires_at: snapshot.expires_at,
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
  useListener(window, resize, "resize", true);

  if (error) {
    notify.failure("Loading storage volume snapshots failed", error);
  }

  if (isSnapshotsLoading || isProjectLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  } else if (!volumeSnapshots) {
    return <>Loading storage volume snapshots failed</>;
  }

  return (
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
              <VolumeConfigureSnapshotBtn
                volume={volume}
                className="u-no-margin--right"
              />
              <VolumeAddSnapshotBtn
                volume={volume}
                className="u-float-right"
                isDisabled={snapshotsDisabled}
              />
            </>
          ) : (
            <div className="p-panel__controls">
              <VolumeSnapshotBulkDelete
                volume={volume}
                snapshotNames={selectedNames}
                onStart={() => {
                  setProcessingNames(selectedNames);
                }}
                onFinish={() => {
                  setProcessingNames([]);
                }}
              />
            </div>
          )}
        </div>
      )}

      {hasSnapshots ? (
        <>
          <ScrollableTable
            dependencies={[filteredSnapshots]}
            tableId="volume-snapshot-table"
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
                    totalCount={volumeSnapshots.length ?? 0}
                    itemName="snapshot"
                    parentName="volume"
                    selectedNames={selectedNames}
                    setSelectedNames={setSelectedNames}
                    filteredNames={filteredSnapshots.map((item) => item.name)}
                  />
                )
              }
            >
              <SelectableMainTable
                id="volume-snapshot-table"
                headers={headers}
                rows={sortedRows}
                sortable
                emptyStateMsg="No snapshot found matching this search"
                itemName="snapshot"
                parentName="instance"
                selectedNames={selectedNames}
                setSelectedNames={setSelectedNames}
                disabledNames={processingNames}
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
          image={<Icon name="snapshot" className="empty-state-icon" />}
          title="No snapshots found"
        >
          <p>
            {project && snapshotsDisabled ? (
              <>
                Snapshots are disabled for project{" "}
                <ResourceLink
                  type="project"
                  value={project.name}
                  to={`/ui/project/${project.name}/configuration`}
                />
                .
              </>
            ) : (
              "There are no snapshots for this volume."
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
          <VolumeConfigureSnapshotBtn
            volume={volume}
            isDisabled={snapshotsDisabled}
          />
          <VolumeAddSnapshotBtn
            volume={volume}
            className="empty-state-button"
            isDisabled={snapshotsDisabled}
          />
        </EmptyState>
      )}
    </div>
  );
};

export default StorageVolumeSnapshots;
