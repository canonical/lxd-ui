import type { FC } from "react";
// import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import StorageBucketsFilter, {
  QUERY,
  POOL,
} from "pages/storage/StorageBucketsFilter";
import { useDocs } from "context/useDocs";
import {
  ACTIONS_COL,
  COLUMN_WIDTHS,
  POOL_COL,
  NAME_COL,
  SIZE_COL,
  URL_COL,
} from "util/storageBucketTable";
// import useEventListener from "util/useEventListener";
import useSortTableData from "util/useSortTableData";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import { useLoadBuckets } from "context/useBuckets";
import type { StorageBucketsFilterType } from "./StorageBucketsFilter";
import StorageBucketsActions from "./actions/StorageBucketActions";
import CreateBucketBtn from "./actions/CreateBucketBtn";
// import { figureCollapsedScreen } from "util/storageVolume";

const StorageBuckets: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const [searchParams] = useSearchParams();
  // const [isSmallScreen, setSmallScreen] = useState(figureCollapsedScreen());
  // const resize = () => {
  //   setSmallScreen(figureCollapsedScreen());
  // };
  // useEventListener("resize", resize);

  const filters: StorageBucketsFilterType = {
    queries: searchParams.getAll(QUERY),
    pools: searchParams.getAll(POOL),
  };

  if (!project) {
    return <>Missing project</>;
  }

  const { data: buckets = [], error, isLoading } = useLoadBuckets(project);

  if (error) {
    notify.failure("Loading storage buckets failed", error);
  }

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
    {
      content: SIZE_COL,
      className: "size",
      style: { width: COLUMN_WIDTHS[SIZE_COL] },
    },
    {
      content: URL_COL,
      sortKey: "createdAt",
      style: { width: COLUMN_WIDTHS[URL_COL] },
    },

    {
      content: "",
      className: "actions u-align--right",
      "aria-label": "Actions",
      style: { width: COLUMN_WIDTHS[ACTIONS_COL] },
    },
  ];

  const filteredBuckets = buckets.filter((item) => {
    if (!filters.queries.every((q) => item.name.toLowerCase().includes(q))) {
      return false;
    }
    if (filters.pools.length > 0 && !filters.pools.includes(item.pool)) {
      return false;
    }
    return true;
  });

  const rows = filteredBuckets.map((bucket) => {
    return {
      key: bucket.name,
      className: "u-row",
      columns: [
        {
          content: (
            <div className="u-truncate" title={bucket.name}>
              {bucket.name}
            </div>
          ),
          role: "rowheader",
          style: { width: COLUMN_WIDTHS[NAME_COL] },
          "aria-label": NAME_COL,
        },
        {
          content: (
            <Link to={`/ui/project/${project}/storage/pool/${bucket.pool}`}>
              {bucket.pool}
            </Link>
          ),
          role: "cell",
          "aria-label": POOL_COL,
          style: { width: COLUMN_WIDTHS[POOL_COL] },
        },
        {
          content: bucket.config.size,
          role: "cell",
          className: "pool",
          style: { width: COLUMN_WIDTHS[SIZE_COL] },
          "aria-label": SIZE_COL,
        },
        {
          content: (
            <div className="u-truncate" title={bucket.s3_url}>
              {bucket.s3_url}
            </div>
          ),
          role: "cell",
          "aria-label": URL_COL,
          style: { width: COLUMN_WIDTHS[URL_COL] },
        },
        {
          className: "actions u-align--right",
          content: (
            <StorageBucketsActions
              bucket={bucket}
              className="storage-bucket-actions u-no-margin--bottom"
            />
          ),
          role: "cell",
          "aria-label": ACTIONS_COL,
          style: { width: COLUMN_WIDTHS[ACTIONS_COL] },
        },
      ],
      sortData: {
        name: bucket.name,
        pool: bucket.pool,
        size: bucket.config.size,
        s3_url: bucket.s3_url,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
  });

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  const hasBuckets = buckets.length !== 0;

  const content = !hasBuckets ? (
    <EmptyState
      className="empty-state"
      image={<Icon name="switcher-dashboard" className="empty-state-icon" />}
      title="No buckets found in this project"
    >
      <p>Storage buckets will appear here</p>
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
      <CreateBucketBtn className="empty-state-button" />
    </EmptyState>
  ) : (
    <div className="storage-volumes">
      <ScrollableTable
        dependencies={[buckets]}
        tableId="bucket-table"
        belowIds={["status-bar"]}
      >
        <TablePagination
          data={sortedRows}
          id="pagination"
          itemName="bucket"
          className="u-no-margin--top"
          aria-label="Table pagination control"
        >
          <MainTable
            id="bucket-table"
            headers={headers}
            sortable
            emptyStateMsg="No bucket found matching this search"
            className="storage-volume-table"
            onUpdateSort={updateSort}
          />
        </TablePagination>
      </ScrollableTable>
    </div>
  );

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
                Buckets
              </HelpLink>
            </PageHeader.Title>
            {hasBuckets && (
              <PageHeader.Search>
                <StorageBucketsFilter key={project} buckets={buckets} />
              </PageHeader.Search>
            )}
          </PageHeader.Left>
          {hasBuckets && (
            <PageHeader.BaseActions>
              <CreateBucketBtn className="u-float-right u-no-margin--bottom" />
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

export default StorageBuckets;
