import { FC } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
} from "@canonical/react-components";
import { fetchStoragePools } from "api/storage-pools";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import { Link, useParams } from "react-router-dom";
import DeleteStoragePoolBtn from "pages/storage/actions/DeleteStoragePoolBtn";
import StoragePoolSize from "pages/storage/StoragePoolSize";
import CreateStoragePoolBtn from "pages/storage/actions/CreateStoragePoolBtn";
import ScrollableTable from "components/ScrollableTable";
import StorageVolumesInPoolBtn from "pages/storage/actions/StorageVolumesInPoolBtn";
import { useDocs } from "context/useDocs";

const StoragePools: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: pools = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.storage, project],
    queryFn: () => fetchStoragePools(project),
  });

  if (error) {
    notify.failure("Loading storage pools failed", error);
  }

  const isDefaultProject = project === "default";

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Driver", sortKey: "driver" },
    { content: "Size", className: "size" },
    {
      content: (
        <>
          Volumes
          <br />
          (this project)
        </>
      ),
      sortKey: "projectVolumes",
      className: "u-align--right",
    },
    {
      content: (
        <>
          Volumes
          <br />
          (all projects)
        </>
      ),
      sortKey: "allVolumes",
      className: "u-align--right",
    },
    { content: "Status", sortKey: "status" },
    { "aria-label": "Actions", className: "u-align--right actions" },
  ];

  const rows = pools.map((pool) => {
    const volumes =
      pool.used_by?.filter((url) => !url.startsWith("/1.0/profiles")) ?? [];
    const currentProjectVolumeCount = volumes.filter((url) =>
      isDefaultProject
        ? !url.includes("project=")
        : url.includes("project=" + project),
    ).length;
    const totalVolumeCount = volumes.length;

    return {
      columns: [
        {
          content: (
            <Link to={`/ui/project/${project}/storage/pool/${pool.name}`}>
              {pool.name}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: pool.driver,
          role: "rowheader",
          "aria-label": "Driver",
        },
        {
          content: <StoragePoolSize pool={pool} />,
          role: "rowheader",
          "aria-label": "Size",
          className: "size",
        },
        {
          content: (
            <StorageVolumesInPoolBtn
              project={project}
              pool={pool.name}
              appearance="link"
              className="u-no-margin--bottom"
            >
              {currentProjectVolumeCount}
            </StorageVolumesInPoolBtn>
          ),
          role: "rowheader",
          className: "u-align--right",
          "aria-label": "Volumes in this projects",
        },
        {
          content: totalVolumeCount,
          role: "rowheader",
          className: "u-align--right",
          "aria-label": "Volumes in all projects",
        },
        {
          content: pool.status,
          role: "rowheader",
          "aria-label": "Status",
        },
        {
          content: (
            <DeleteStoragePoolBtn
              key={pool.name}
              pool={pool}
              project={project}
            />
          ),
          role: "rowheader",
          className: "u-align--right actions",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: pool.name.toLowerCase(),
        driver: pool.driver,
        status: pool.status,
        projectVolumes: currentProjectVolumeCount,
        allVolumes: totalVolumeCount,
      },
    };
  });

  if (isLoading) {
    return <Loader text="Loading storage pools..." />;
  }

  return pools.length > 0 ? (
    <Row>
      <div className="upper-controls-bar">
        <CreateStoragePoolBtn project={project} />
      </div>
      <ScrollableTable
        dependencies={[pools]}
        tableId="storage-pool-table"
        belowIds={["status-bar"]}
      >
        <MainTable
          id="storage-pool-table"
          headers={headers}
          rows={rows}
          sortable
          className="storage-pool-table"
        />
      </ScrollableTable>
    </Row>
  ) : (
    <EmptyState
      className="empty-state"
      image={<Icon name="pods" className="empty-state-icon" />}
      title="No pools found in this project"
    >
      <p>Storage pools will appear here.</p>
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
      <CreateStoragePoolBtn project={project} className="empty-state-button" />
    </EmptyState>
  );
};

export default StoragePools;
