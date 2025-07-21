import type { FC } from "react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  EmptyState,
  Icon,
  Row,
  TablePagination,
  useListener,
  useNotify,
} from "@canonical/react-components";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import CreateVolumeBtn from "pages/storage/actions/CreateVolumeBtn";
import type { StorageVolumesFilterType } from "pages/storage/StorageVolumesFilter";
import { CLUSTER_MEMBER } from "pages/storage/StorageVolumesFilter";
import StorageVolumesFilter, {
  CONTENT_TYPE,
  POOL,
  QUERY,
  VOLUME_TYPE,
} from "pages/storage/StorageVolumesFilter";
import StorageVolumeSize from "pages/storage/StorageVolumeSize";
import { useDocs } from "context/useDocs";
import {
  figureCollapsedScreen,
  getSnapshotsPerVolume,
  hasVolumeDetailPage,
  isSnapshot,
  renderContentType,
  renderVolumeType,
} from "util/storageVolume";
import {
  ACTIONS_COL,
  COLUMN_WIDTHS,
  CLUSTER_MEMBER_COL,
  CONTENT_TYPE_COL,
  NAME_COL,
  POOL_COL,
  SIZE_COL,
  SNAPSHOTS_COL,
  TYPE_COL,
  USED_BY_COL,
} from "util/storageVolumeTable";
import StorageVolumeNameLink from "./StorageVolumeNameLink";
import CustomStorageVolumeActions from "./actions/CustomStorageVolumeActions";
import useSortTableData from "util/useSortTableData";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import { useLoadVolumes } from "context/useVolumes";
import { useIsClustered } from "context/useIsClustered";
import ResourceLink from "components/ResourceLink";
import SelectableMainTable from "components/SelectableMainTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import type { LxdStorageVolume } from "types/storage";
import StorageVolumeBulkDelete from "./actions/StorageVolumeBulkDelete";

const StorageVolumes: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const [searchParams] = useSearchParams();
  const [isSmallScreen, setSmallScreen] = useState(figureCollapsedScreen());
  const isClustered = useIsClustered();
  const resize = () => {
    setSmallScreen(figureCollapsedScreen());
  };
  useListener(window, resize, "resize", true);

  const filters: StorageVolumesFilterType = {
    queries: searchParams.getAll(QUERY).map((query) => query.toLowerCase()),
    pools: searchParams.getAll(POOL),
    volumeTypes: searchParams
      .getAll(VOLUME_TYPE)
      .map((type) => (type === "VM" ? "virtual-machine" : type.toLowerCase())),
    contentTypes: searchParams
      .getAll(CONTENT_TYPE)
      .map((type) => type.toLowerCase()),
    clusterMembers: searchParams
      .getAll(CLUSTER_MEMBER)
      .map((member) => member.toLowerCase()),
  };

  if (!project) {
    return <>Missing project</>;
  }

  const { data: volumes = [], error, isLoading } = useLoadVolumes(project);

  const getVolumeKey = (volume: LxdStorageVolume) => {
    return `${volume.name}-${volume.pool}-${volume.location || ""}`;
  };
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingVolumes, setProcessingVolumes] = useState<string[]>([]);

  if (error) {
    notify.failure("Loading storage volumes failed", error);
  }

  useEffect(() => {
    const validKeys = new Set(volumes.map(getVolumeKey));
    const validSelections = selectedNames.filter((name) => validKeys.has(name));
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [volumes]);

  const headers = [
    {
      content: NAME_COL,
      sortKey: "name",
      style: { width: COLUMN_WIDTHS[NAME_COL] },
    },
    {
      content: POOL_COL,
      sortKey: "pool",
      style: { width: COLUMN_WIDTHS[POOL_COL] },
      className: "pool",
    },
    ...(isClustered
      ? [
          {
            content: CLUSTER_MEMBER_COL,
            sortKey: "clusterMember",
            style: { width: COLUMN_WIDTHS[CLUSTER_MEMBER_COL] },
          },
        ]
      : []),
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
    {
      content: SIZE_COL,
      className: "u-align--right size",
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
    if (
      filters.clusterMembers.length > 0 &&
      !filters.clusterMembers.includes(
        item.location.length === 0 ? "cluster-wide" : item.location,
      )
    ) {
      return false;
    }
    return true;
  });

  const snapshotsPerVolume = getSnapshotsPerVolume(volumes);
  const rows = filteredVolumes.map((volume) => {
    const key = getVolumeKey(volume);
    const volumeType = renderVolumeType(volume);
    const contentType = renderContentType(volume);
    const snapshotCount = snapshotsPerVolume[key]?.length ?? 0;
    const canSelect = hasVolumeDetailPage(volume);

    return {
      key,
      name: canSelect ? key : undefined,
      className: "u-row",
      columns: [
        {
          content: <StorageVolumeNameLink volume={volume} />,
          role: "rowheader",
          style: { width: COLUMN_WIDTHS[NAME_COL] },
          "aria-label": NAME_COL,
        },
        {
          content: (
            <ResourceLink
              type="pool"
              value={volume.pool}
              to={`/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(volume.pool)}`}
            />
          ),
          role: "cell",
          className: "pool",
          style: { width: COLUMN_WIDTHS[POOL_COL] },
          "aria-label": POOL_COL,
        },
        ...(isClustered
          ? [
              {
                content: volume.location ? (
                  <ResourceLink
                    type="cluster-member"
                    to="/ui/cluster"
                    value={volume.location}
                  />
                ) : (
                  <ResourceLink
                    type="cluster-group"
                    value="Cluster wide"
                    to="/ui/cluster"
                  />
                ),
                role: "cell",
                style: { width: COLUMN_WIDTHS[CLUSTER_MEMBER_COL] },
                "aria-label": CLUSTER_MEMBER_COL,
              },
            ]
          : []),
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
        {
          content: <StorageVolumeSize volume={volume} />,
          role: "cell",
          "aria-label": SIZE_COL,
          className: "u-align--right size",
          style: { width: COLUMN_WIDTHS[SIZE_COL] },
        },
        {
          className: "u-align--right used_by",
          content: (
            <>
              {volume.used_by?.length ?? 0}
              {isSmallScreen && (
                <div className="u-text--muted">{snapshotCount}</div>
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
                content: snapshotCount,
                role: "cell",
                "aria-label": SNAPSHOTS_COL,
                style: { width: COLUMN_WIDTHS[SNAPSHOTS_COL] },
              },
            ]),
        {
          className: "actions u-align--right",
          content: hasVolumeDetailPage(volume) ? (
            <CustomStorageVolumeActions
              volume={volume}
              className="storage-volume-actions u-no-margin--bottom"
            />
          ) : (
            <StorageVolumeNameLink
              volume={volume}
              overrideName={`go to ${
                volume.type === "image"
                  ? "images list"
                  : volume.content_type === "iso"
                    ? "custom ISOs"
                    : "instance"
              }`}
              className="storage-volume-actions u-align--right"
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
        clusterMember: volume.location,
        contentType: contentType,
        type: volumeType,
        usedBy: volume.used_by?.length ?? 0,
        snapshots: snapshotCount,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
  });

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  const defaultPoolForVolumeCreate =
    filters.pools.length === 1 ? filters.pools[0] : "";

  const hasVolumes = volumes.length !== 0;

  const content = !hasVolumes ? (
    <EmptyState
      className="empty-state"
      image={<Icon name="switcher-dashboard" className="empty-state-icon" />}
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
      <CreateVolumeBtn projectName={project} className="empty-state-button" />
    </EmptyState>
  ) : (
    <div className="storage-volumes">
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
          description={
            selectedNames.length > 0 && (
              <SelectedTableNotification
                totalCount={
                  volumes.filter(
                    (volume) =>
                      !isSnapshot(volume) && hasVolumeDetailPage(volume),
                  ).length
                }
                itemName="volume"
                parentName="project"
                selectedNames={selectedNames}
                setSelectedNames={setSelectedNames}
                filteredNames={filteredVolumes
                  .filter(hasVolumeDetailPage)
                  .map(getVolumeKey)}
              />
            )
          }
        >
          <SelectableMainTable
            className="storage-volume-table"
            id="volume-table"
            headers={headers}
            rows={sortedRows}
            sortable
            emptyStateMsg="No volumes found matching this search"
            itemName="volume"
            parentName="project"
            selectedNames={selectedNames}
            setSelectedNames={setSelectedNames}
            disabledNames={processingVolumes}
            filteredNames={filteredVolumes.map(getVolumeKey)}
            onUpdateSort={updateSort}
            defaultSortDirection="descending"
          />
        </TablePagination>
      </ScrollableTable>
    </div>
  );

  const selectedVolumes = volumes.filter((volume) => {
    const volumeKey = getVolumeKey(volume);
    return selectedNames.includes(volumeKey);
  });

  return (
    <CustomLayout
      mainClassName="storage-volume-list"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                href={`${docBaseLink}/explanation/storage/`}
                title="Learn more about storage pools, volumes and buckets"
              >
                Volumes
              </HelpLink>
            </PageHeader.Title>
            {!selectedNames.length && hasVolumes && (
              <PageHeader.Search>
                <StorageVolumesFilter key={project} volumes={volumes} />
              </PageHeader.Search>
            )}
            {!!selectedNames.length && (
              <StorageVolumeBulkDelete
                volumes={selectedVolumes}
                onStart={() => {
                  setProcessingVolumes(selectedNames);
                }}
                onFinish={() => {
                  setProcessingVolumes([]);
                }}
              />
            )}
          </PageHeader.Left>
          {hasVolumes && (
            <PageHeader.BaseActions>
              <CreateVolumeBtn
                projectName={project}
                defaultPool={defaultPoolForVolumeCreate}
                className="u-float-right u-no-margin--bottom"
              />
            </PageHeader.BaseActions>
          )}
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>{content}</Row>
    </CustomLayout>
  );
};

export default StorageVolumes;
