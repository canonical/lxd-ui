import React, { FC } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  EmptyState,
  Icon,
  MainTable,
  useNotify,
} from "@canonical/react-components";
import Loader from "components/Loader";
import { isoTimeToString } from "util/helpers";
import DeleteStorageVolumeBtn from "pages/storage/actions/DeleteStorageVolumeBtn";
import { loadVolumes } from "context/loadIsoVolumes";
import ScrollableTable from "components/ScrollableTable";
import { usePagination } from "util/pagination";
import Pagination from "components/Pagination";
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
  contentTypeForDisplay,
  volumeTypeForDisplay,
} from "util/storageVolume";

const StorageVolumes: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const [searchParams] = useSearchParams();

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
    { content: "Name", sortKey: "name" },
    { content: "Pool", sortKey: "pool" },
    { content: "Type", sortKey: "type" },
    { content: "Content type", sortKey: "contentType" },
    { content: "Created at", sortKey: "createdAt" },
    { content: "Size", className: "u-align--right" },
    {
      content: "Used by",
      sortKey: "usedBy",
      className: "u-align--right used_by",
    },
    {
      content: "",
      className: "actions",
      "aria-label": "Actions",
    },
  ];

  const filteredVolumes = volumes.filter((item) => {
    if (!filters.queries.every((q) => item.name.toLowerCase().includes(q))) {
      return false;
    }
    if (filters.pools.length > 0 && !filters.pools.includes(item.pool)) {
      return false;
    }
    if (
      filters.volumeTypes.length > 0 &&
      !filters.volumeTypes.includes(item.type) &&
      (!filters.volumeTypes.includes("snapshot") || !item.name.includes("/"))
    ) {
      return false;
    }
    if (
      filters.volumeTypes.length > 0 &&
      !filters.volumeTypes.includes("snapshot") &&
      item.name.includes("/")
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

  const rows = filteredVolumes.map((volume) => {
    const volumeType = volumeTypeForDisplay(volume);
    const contentType = contentTypeForDisplay(volume);

    return {
      columns: [
        {
          // If the volume name contains a slash, it's a snapshot, and we don't want to link to it
          content: volume.name.includes("/") ? (
            volume.name
          ) : (
            <div className="u-truncate" title={volume.name}>
              <Link
                to={`/ui/project/${project}/storage/detail/${volume.pool}/${volume.type}/${volume.name}`}
              >
                {volume.name}
              </Link>
            </div>
          ),
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: (
            <Link to={`/ui/project/${project}/storage/detail/${volume.pool}`}>
              {volume.pool}
            </Link>
          ),
          role: "cell",
          "aria-label": "Pool",
        },
        {
          content: volumeType,
          role: "cell",
          "aria-label": "Type",
        },
        {
          content: contentType,
          role: "cell",
          "aria-label": "Content type",
        },
        {
          content: isoTimeToString(volume.created_at),
          role: "cell",
          "aria-label": "Created at",
        },
        {
          content: <StorageVolumeSize volume={volume} />,
          role: "cell",
          "aria-label": "Size",
          className: "u-align--right",
        },
        {
          className: "u-align--right used_by",
          content: volume.used_by?.length ?? 0,
          role: "cell",
          "aria-label": "Used by",
        },
        {
          className: "actions u-align--right",
          content: (
            <>
              <DeleteStorageVolumeBtn
                volume={volume}
                project={project}
                onFinish={() => {
                  notify.success(`Storage volume ${volume.name} deleted.`);
                }}
              />
            </>
          ),
          role: "cell",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: volume.name,
        pool: volume.pool,
        contentType: contentType,
        type: volumeType,
        createdAt: volume.created_at,
        usedBy: volume.used_by?.length ?? 0,
      },
    };
  });

  const pagination = usePagination(rows);

  if (isLoading) {
    return <Loader text="Loading storage volumes..." />;
  }

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
          rel="noreferrer"
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
          <CreateVolumeBtn project={project} />
        </div>
      </div>
      <Pagination
        {...pagination}
        id="pagination"
        className="u-no-margin--top"
        totalCount={volumes.length}
        visibleCount={
          filteredVolumes.length === volumes.length
            ? pagination.pageData.length
            : filteredVolumes.length
        }
        keyword="volume"
      />
      <ScrollableTable dependencies={[volumes]}>
        <MainTable
          headers={headers}
          rows={pagination.pageData}
          sortable
          emptyStateMsg="No volumes found matching this search"
          className="storage-volume-table"
          onUpdateSort={pagination.updateSort}
        />
      </ScrollableTable>
    </div>
  );
};

export default StorageVolumes;
