import { type FC } from "react";
import { Link } from "react-router-dom";
import {
  Row,
  ScrollableTable,
  TablePagination,
  useNotify,
  Spinner,
  MainTable,
  Panel,
  EmptyState,
  Icon,
} from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import { useReplicators } from "context/useReplicators";
import useSortTableData from "util/useSortTableData";
import { CreateReplicatorButton } from "pages/cluster/actions/CreateReplicatorBtn";
import ReplicatorRunTime from "pages/cluster/ReplicatorRunTime";
import ReplicatorStatus from "pages/cluster/ReplicatorStatus";
import { useDocs } from "context/useDocs";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import { ROOT_PATH } from "util/rootPath";
import ClusterLinkRichChip from "./ClusterLinkRichChip";

interface Props {
  variant?: "main" | "panel";
}

const ReplicatorList: FC<Props> = ({ variant = "main" }) => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { data: replicators = [], error, isLoading } = useReplicators();

  if (error) {
    notify.failure("Loading replicators failed", error);
  }
  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
    {
      content: "Project",
      sortKey: "project",
    },
    {
      content: "Cluster",
      sortKey: "cluster",
    },
    {
      content: "Status",
      sortKey: "status",
      className: "status-header",
    },
    {
      content: "Last run at",
      sortKey: "last_run_at",
    },
  ];

  const rows = replicators.map((replicator) => {
    const rowKey = `${replicator.name} ${replicator.project}`;
    return {
      key: rowKey,
      name: rowKey,
      columns: [
        {
          content: (
            <Link
              to={`${ROOT_PATH}/ui/project/${encodeURIComponent(replicator.project)}/replicator/${encodeURIComponent(replicator.name)}`}
              className="u-truncate"
            >
              {replicator.name}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "Name",
          title: `Replicator ${replicator.name}`,
        },
        {
          content: (
            <div className="u-truncate" title={replicator.description}>
              {replicator.description || "-"}
            </div>
          ),
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: <ProjectRichChip projectName={replicator.project} />,
          role: "cell",
          "aria-label": "Project",
        },
        {
          content: (
            <ClusterLinkRichChip
              clusterLink={replicator.config?.cluster || "unknown"}
            />
          ),
          role: "cell",
          "aria-label": "Cluster",
        },
        {
          content: <ReplicatorStatus replicator={replicator} />,
          role: "cell",
          "aria-label": "Status",
        },
        {
          content: <ReplicatorRunTime replicator={replicator} />,
          role: "cell",
        },
      ],
      sortData: {
        name: replicator.name.toLowerCase(),
        description: replicator.description.toLowerCase(),
        project: replicator.project.toLowerCase(),
        cluster: replicator.config?.cluster?.toLowerCase() ?? "",
        status: replicator.last_run_status?.toLowerCase() ?? "",
        last_run_at: replicator.last_run_at ?? "",
      },
    };
  });
  const { rows: sortedRows, updateSort } = useSortTableData({ rows });
  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }
  const isEmptyState = replicators.length === 0 && !isLoading;
  const Element = variant === "main" ? BaseLayout : Panel;

  return (
    <>
      <Element
        title={
          <HelpLink
            docPath="/explanation/replicators/"
            title="Learn more about replicators"
          >
            Replicators
          </HelpLink>
        }
        controls={
          !isEmptyState && (
            <>
              <CreateReplicatorButton />
            </>
          )
        }
      >
        {variant === "main" && <NotificationRow />}
        <Row>
          {!isEmptyState && (
            <>
              <ScrollableTable
                dependencies={[replicators, notify.notification]}
                tableId="replicator-table-id"
                belowIds={["status-bar"]}
              >
                <TablePagination
                  data={sortedRows}
                  id="pagination"
                  itemName="replicator"
                  className="u-no-margin--top"
                  aria-label="Table pagination control"
                >
                  <MainTable
                    id="replicator-table-id"
                    className="replicator-table"
                    headers={headers}
                    sortable
                    onUpdateSort={updateSort}
                  />
                </TablePagination>
              </ScrollableTable>
            </>
          )}
          {isEmptyState && (
            <EmptyState
              className="empty-state"
              image={<Icon name="connected" className="empty-state-icon" />}
              title="No replicators found"
            >
              <p>There are no replicators on this server.</p>
              <p>
                <a
                  href={`${docBaseLink}/explanation/replicators/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about replicators
                  <Icon className="external-link-icon" name="external-link" />
                </a>
              </p>
              <CreateReplicatorButton />
            </EmptyState>
          )}
        </Row>
      </Element>
    </>
  );
};

export default ReplicatorList;
