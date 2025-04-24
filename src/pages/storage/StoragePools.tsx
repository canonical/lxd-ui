import type { FC } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
} from "@canonical/react-components";
import Loader from "components/Loader";
import { Link, useParams } from "react-router-dom";
import DeleteStoragePoolBtn from "pages/storage/actions/DeleteStoragePoolBtn";
import StoragePoolSize from "pages/storage/StoragePoolSize";
import CreateStoragePoolBtn from "pages/storage/actions/CreateStoragePoolBtn";
import ScrollableTable from "components/ScrollableTable";
import StorageVolumesInPoolBtn from "pages/storage/actions/StorageVolumesInPoolBtn";
import { useDocs } from "context/useDocs";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import { useStoragePools } from "context/useStoragePools";
import classNames from "classnames";
import { StoragePoolClusterMember } from "./StoragePoolClusterMember";
import { useIsClustered } from "context/useIsClustered";

const StoragePools: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const isClustered = useIsClustered();

  if (!project) {
    return <>Missing project</>;
  }

  const { data: pools = [], error, isLoading } = useStoragePools();

  if (error) {
    notify.failure("Loading storage pools failed", error);
  }

  const isDefaultProject = project === "default";

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Driver", sortKey: "driver", className: "driver" },
    ...(isClustered
      ? [{ content: "Cluster member", className: "cluster-member" }]
      : []),
    {
      content: "Size",
      className: classNames("size", { clustered: isClustered }),
    },
    {
      content: (
        <>
          Volumes
          <br />
          (this project)
        </>
      ),
      sortKey: "projectVolumes",
      className: "u-align--right volumes-this-project",
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
      className: "u-align--right volumes-total",
    },
    { content: "Status", sortKey: "status", className: "status" },
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
      key: pool.name,
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
          role: "cell",
          "aria-label": "Driver",
          className: "driver",
        },
        ...(isClustered
          ? [
              {
                content: <StoragePoolClusterMember pool={pool} />,
                role: "cell",
                "aria-label": "Cluster member",
                className: "cluster-member",
              },
            ]
          : []),
        {
          content: <StoragePoolSize pool={pool} hasMeterBar />,
          role: "cell",
          "aria-label": "Size",
          className: classNames("size", { clustered: isClustered }),
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
          role: "cell",
          className: "u-align--right volumes-this-project",
          "aria-label": "Volumes in this projects",
        },
        {
          content: totalVolumeCount,
          role: "cell",
          className: "u-align--right volumes-total",
          "aria-label": "Volumes in all projects",
        },
        {
          content: pool.status,
          role: "cell",
          "aria-label": "Status",
          className: "status",
        },
        {
          content: (
            <DeleteStoragePoolBtn
              key={pool.name}
              pool={pool}
              project={project}
            />
          ),
          role: "cell",
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
    return <Loader isMainComponent />;
  }

  const content =
    pools.length > 0 ? (
      <Row>
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
        image={<Icon name="switcher-dashboard" className="empty-state-icon" />}
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
        <CreateStoragePoolBtn
          project={project}
          className="empty-state-button"
        />
      </EmptyState>
    );

  return (
    <CustomLayout
      contentClassName="detail-page"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                href={`${docBaseLink}/explanation/storage/`}
                title="Learn more about storage pools, volumes and buckets"
              >
                Pools
              </HelpLink>
            </PageHeader.Title>
          </PageHeader.Left>
          <PageHeader.BaseActions>
            <CreateStoragePoolBtn
              project={project}
              className="u-float-right u-no-margin--bottom"
            />
          </PageHeader.BaseActions>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>{content}</Row>
    </CustomLayout>
  );
};

export default StoragePools;
