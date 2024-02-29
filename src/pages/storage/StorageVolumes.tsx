import { FC, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  EmptyState,
  Icon,
  MainTable,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import Loader from "components/Loader";
import { isoTimeToString } from "util/helpers";
import { loadVolumes } from "context/loadIsoVolumes";
import ScrollableTable from "components/ScrollableTable";
import CreateVolumeBtn from "pages/storage/actions/CreateVolumeBtn";
import StorageVolumesFilter, {
  CONTENT_TYPE,
  POOL,
  QUERY,
  StorageVolumesFilterType,
  VOLUME_TYPE,
} from "pages/storage/StorageVolumesFilter";
import StorageVolumeSize from "pages/storage/StorageVolumeSize";
import { useDocs } from "context/useDocs";
import {
  renderContentType,
  figureCollapsedScreen,
  getSnapshotsPerVolume,
  isSnapshot,
  renderVolumeType,
} from "util/storageVolume";
import {
  ACTIONS_COL,
  COLUMN_WIDTHS,
  CONTENT_TYPE_COL,
  CREATED_AT_COL,
  NAME_COL,
  POOL_COL,
  SIZE_COL,
  SNAPSHOTS_COL,
  TYPE_COL,
  USED_BY_COL,
} from "util/storageVolumeTable";
import StorageVolumeNameLink from "./StorageVolumeNameLink";
import CustomStorageVolumeActions from "./actions/CustomStorageVolumeActions";
import classnames from "classnames";
import useEventListener from "@use-it/event-listener";
import { useProject } from "context/project";
import { isSnapshotsDisabled } from "util/snapshots";
import useSortTableData from "util/useSortTableData";

const StorageVolumes: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const [searchParams] = useSearchParams();
  const [isSmallScreen, setSmallScreen] = useState(figureCollapsedScreen());
  const resize = () => {
    setSmallScreen(figureCollapsedScreen());
  };
  useEventListener("resize", resize);
  const { project: projectConfig, isLoading: isProjectLoading } = useProject();
  const snapshotsDisabled = isSnapshotsDisabled(projectConfig);

  const filters: StorageVolumesFilterType = {
    queries: searchParams.getAll(QUERY),
    pools: searchParams.getAll(POOL),
    volumeTypes: searchParams
      .getAll(VOLUME_TYPE)
      .map((type) => (type === "VM" ? "virtual-machine" : type.toLowerCase())),
    contentTypes: searchParams
      .getAll(CONTENT_TYPE)
      .map((type) => type.toLowerCase()),
  };

  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: volumes = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.volumes, project],
    queryFn: () => loadVolumes(project),
  });

  if (error) {
    notify.failure("Loading storage volumes failed", error);
  }

  const headers = [
    {
      content: isSmallScreen ? (
        <>
          {NAME_COL}
          <br />
          <div className="header-second-row">{CREATED_AT_COL}</div>
        </>
      ) : (
        NAME_COL
      ),
      sortKey: isSmallScreen ? "createdAt" : "name",
      style: { width: COLUMN_WIDTHS[NAME_COL] },
    },
    {
      content: POOL_COL,
      sortKey: "pool",
      style: { width: COLUMN_WIDTHS[POOL_COL] },
    },
    {
      content: isSmallScreen ? (
        <>
          {TYPE_COL}
          <br />
          <div className="header-second-row">{CONTENT_TYPE_COL}</div>
        </>
      ) : (
        TYPE_COL
      ),
      sortKey: isSmallScreen ? "contentType" : "type",
      style: {
        width: COLUMN_WIDTHS[isSmallScreen ? CONTENT_TYPE_COL : TYPE_COL],
      },
    },
    ...(isSmallScreen
      ? []
      : [
          {
            content: CONTENT_TYPE_COL,
            sortKey: "contentType",
            style: { width: COLUMN_WIDTHS[CONTENT_TYPE_COL] },
          },
        ]),
    ...(isSmallScreen
      ? []
      : [
          {
            content: CREATED_AT_COL,
            sortKey: "createdAt",
            style: { width: COLUMN_WIDTHS[CREATED_AT_COL] },
          },
        ]),
    {
      content: SIZE_COL,
      className: "u-align--right",
      style: { width: COLUMN_WIDTHS[SIZE_COL] },
    },
    {
      content: isSmallScreen ? (
        <>
          {USED_BY_COL}
          <br />
          <div className="header-second-row">{SNAPSHOTS_COL}</div>
        </>
      ) : (
        USED_BY_COL
      ),
      sortKey: isSmallScreen ? "snapshots" : "usedBy",
      className: "u-align--right used_by",
      style: {
        width: COLUMN_WIDTHS[isSmallScreen ? SNAPSHOTS_COL : USED_BY_COL],
      },
    },
    ...(isSmallScreen
      ? []
      : [
          {
            className: "u-align--right",
            content: SNAPSHOTS_COL,
            sortKey: "snapshots",
            style: { width: COLUMN_WIDTHS[SNAPSHOTS_COL] },
          },
        ]),
    {
      content: "",
      className: "actions u-align--right",
      "aria-label": "Actions",
      style: { width: COLUMN_WIDTHS[ACTIONS_COL] },
    },
  ];

  const filteredVolumes = volumes.filter((item) => {
    if (isSnapshot(item)) {
      return false;
    }

    if (!filters.queries.every((q) => item.name.toLowerCase().includes(q))) {
      return false;
    }
    if (filters.pools.length > 0 && !filters.pools.includes(item.pool)) {
      return false;
    }
    if (
      filters.volumeTypes.length > 0 &&
      !filters.volumeTypes.includes(item.type)
    ) {
      return false;
    }
    if (
      filters.contentTypes.length > 0 &&
      !filters.contentTypes.includes(item.content_type)
    ) {
      return false;
    }
    return true;
  });

  const snapshotPerVolumeLookup = getSnapshotsPerVolume(volumes);
  const rows = filteredVolumes.map((volume) => {
    const volumeType = renderVolumeType(volume);
    const contentType = renderContentType(volume);

    return {
      className: "u-row",
      columns: [
        {
          content: (
            <>
              <StorageVolumeNameLink
                volume={volume}
                project={project}
                isExternalLink={volume.type !== "custom"}
              />
              {isSmallScreen && (
                <div className="u-text--muted">
                  {isoTimeToString(volume.created_at)}
                </div>
              )}
            </>
          ),
          role: "cell",
          style: { width: COLUMN_WIDTHS[NAME_COL] },
          "aria-label": NAME_COL,
        },
        {
          content: (
            <Link to={`/ui/project/${project}/storage/pool/${volume.pool}`}>
              {volume.pool}
            </Link>
          ),
          role: "cell",
          style: { width: COLUMN_WIDTHS[POOL_COL] },
          "aria-label": POOL_COL,
        },
        {
          content: (
            <>
              {volumeType}
              {isSmallScreen && (
                <div className="u-text--muted">{contentType}</div>
              )}
            </>
          ),
          role: "cell",
          "aria-label": TYPE_COL,
          style: {
            width: COLUMN_WIDTHS[isSmallScreen ? CONTENT_TYPE_COL : TYPE_COL],
          },
        },
        ...(isSmallScreen
          ? []
          : [
              {
                content: contentType,
                role: "cell",
                "aria-label": CONTENT_TYPE_COL,
                style: { width: COLUMN_WIDTHS[CONTENT_TYPE_COL] },
              },
            ]),
        ...(isSmallScreen
          ? []
          : [
              {
                content: isoTimeToString(volume.created_at),
                role: "cell",
                "aria-label": CREATED_AT_COL,
                style: { width: COLUMN_WIDTHS[CREATED_AT_COL] },
              },
            ]),
        {
          content: <StorageVolumeSize volume={volume} />,
          role: "cell",
          "aria-label": SIZE_COL,
          className: "u-align--right",
          style: { width: COLUMN_WIDTHS[SIZE_COL] },
        },
        {
          className: "u-align--right used_by",
          content: (
            <>
              {volume.used_by?.length ?? 0}
              {isSmallScreen && (
                <div className="u-text--muted">
                  {snapshotPerVolumeLookup[volume.name]?.length ?? 0}
                </div>
              )}
            </>
          ),
          role: "cell",
          "aria-label": USED_BY_COL,
          style: {
            width: COLUMN_WIDTHS[isSmallScreen ? SNAPSHOTS_COL : USED_BY_COL],
          },
        },
        ...(isSmallScreen
          ? []
          : [
              {
                className: "u-align--right",
                content: snapshotPerVolumeLookup[volume.name]?.length ?? 0,
                role: "cell",
                "aria-label": SNAPSHOTS_COL,
                style: { width: COLUMN_WIDTHS[SNAPSHOTS_COL] },
              },
            ]),
        {
          className: "actions u-align--right",
          content:
            volume.type === "custom" ? (
              <CustomStorageVolumeActions
                volume={volume}
                project={project}
                snapshotDisabled={snapshotsDisabled}
                className={classnames(
                  "storage-volume-actions",
                  "u-no-margin--bottom",
                )}
              />
            ) : (
              <StorageVolumeNameLink
                volume={volume}
                project={project}
                isExternalLink
                overrideName={`go to ${
                  volume.type === "image" ? "images list" : "instance"
                }`}
                className={classnames(
                  "storage-volume-actions",
                  "u-align--right",
                )}
              />
            ),
          role: "cell",
          "aria-label": ACTIONS_COL,
          style: { width: COLUMN_WIDTHS[ACTIONS_COL] },
        },
      ],
      sortData: {
        name: volume.name,
        pool: volume.pool,
        contentType: contentType,
        type: volumeType,
        createdAt: volume.created_at,
        usedBy: volume.used_by?.length ?? 0,
        snapshots: snapshotPerVolumeLookup[volume.name]?.length ?? 0,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
  });

  if (isLoading || isProjectLoading) {
    return <Loader text="Loading storage volumes..." />;
  }

  const defaultPoolForVolumeCreate =
    filters.pools.length === 1 ? filters.pools[0] : "";

  return volumes.length === 0 ? (
    <EmptyState
      className="empty-state"
      image={<Icon name="mount" className="empty-state-icon" />}
      title="No volumes found in this project"
    >
      <p>Storage volumes will appear here</p>
      <p>
        <a
          href={`${docBaseLink}/explanation/storage/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about storage
          <Icon className="external-link-icon" name="external-link" />
        </a>
      </p>
      <CreateVolumeBtn project={project} className="empty-state-button" />
    </EmptyState>
  ) : (
    <div className="storage-volumes">
      <div className="upper-controls-bar">
        <div className="search-box-wrapper">
          <StorageVolumesFilter key={project} volumes={volumes} />
        </div>
        <div>
          <CreateVolumeBtn
            project={project}
            defaultPool={defaultPoolForVolumeCreate}
          />
        </div>
      </div>
      <ScrollableTable
        dependencies={[volumes]}
        tableId="volume-table"
        belowIds={["status-bar"]}
      >
        <TablePagination
          data={sortedRows}
          id="pagination"
          itemName="volume"
          className="u-no-margin--top"
          aria-label="Table pagination control"
        >
          <MainTable
            id="volume-table"
            headers={headers}
            sortable
            emptyStateMsg="No volumes found matching this search"
            className="storage-volume-table"
            onUpdateSort={updateSort}
          />
        </TablePagination>
      </ScrollableTable>
    </div>
  );
};

export default StorageVolumes;
