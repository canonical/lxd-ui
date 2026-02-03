import type { FC } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  ScrollableTable,
  Row,
  useNotify,
  CustomLayout,
  Spinner,
} from "@canonical/react-components";
import { Link, useParams } from "react-router-dom";
import DeleteStoragePoolBtn from "pages/storage/actions/DeleteStoragePoolBtn";
import StoragePoolSize from "pages/storage/StoragePoolSize";
import CreateStoragePoolBtn from "pages/storage/actions/CreateStoragePoolBtn";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import PageHeader from "components/PageHeader";
import { useStoragePools } from "context/useStoragePools";
import classNames from "classnames";
import { StoragePoolClusterMember } from "./StoragePoolClusterMember";
import { useIsClustered } from "context/useIsClustered";
import DocLink from "components/DocLink";
import { ROOT_PATH } from "util/rootPath";

const StoragePools: FC = () => {
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
      content: <>Used by</>,
      sortKey: "usedBy",
      className: "u-align--right volumes-total",
    },
    { content: "Status", sortKey: "status", className: "status" },
    { "aria-label": "Actions", className: "u-align--right actions" },
  ];

  const rows = pools.map((pool) => {
    return {
      key: pool.name,
      columns: [
        {
          content: (
            <Link
              to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(pool.name)}`}
            >
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
          content: pool.used_by?.length ?? 0,
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
        usedBy: pool.used_by?.length ?? 0,
      },
    };
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
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
        image={<Icon name="storage-pool" className="empty-state-icon" />}
        title="No pools found in this project"
      >
        <p>Storage pools will appear here.</p>
        <p>
          <DocLink docPath="/explanation/storage/" hasExternalIcon>
            Learn more about storage pools, volumes and buckets
          </DocLink>
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
                docPath="/explanation/storage/"
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
