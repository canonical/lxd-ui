import { type FC } from "react";
import { Link } from "react-router-dom";
import {
  List,
  MainTable,
  Notification,
  ScrollableTable,
  Spinner,
  TablePagination,
  useNotify,
  Row,
} from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import ReplicatorExplanationTooltip from "pages/cluster/ReplicatorExplanationTooltip";
import NotificationRow from "components/NotificationRow";
import { useClusterLinks } from "context/useClusterLinks";
import { useIsClustered } from "context/useIsClustered";
import { useReplicators } from "context/useReplicators";
import useSortTableData from "util/useSortTableData";
import { CreateReplicatorButton } from "pages/cluster/actions/CreateReplicatorBtn";
import ReplicatorRunTime from "pages/cluster/ReplicatorRunTime";
import ReplicatorStatus from "pages/cluster/ReplicatorStatus";
import { useDocs } from "context/useDocs";
import ClusterLinkRichChip from "pages/cluster/ClusterLinkRichChip";
import CreateClusterLink from "pages/cluster/CreateClusterLink";
import DeleteReplicatorBtn from "pages/cluster/actions/DeleteReplicatorBtn";
import EditReplicatorBtn from "pages/cluster/actions/EditReplicatorBtn";
import RunReplicatorBtn from "pages/cluster/actions/RunReplicatorBtn";
import CreateReplicatorPanel from "pages/cluster/panels/CreateReplicatorPanel";
import EditReplicatorPanel from "pages/cluster/panels/EditReplicatorPanel";
import ReplicatorListEmptyState from "pages/cluster/ReplicatorListEmptyState";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import { ROOT_PATH } from "util/rootPath";
import usePanelParams, { panels } from "util/usePanelParams";

interface Props {
  variant?: "main" | "project-configuration";
  project?: string;
  cluster?: string;
}

const ReplicatorList: FC<Props> = ({ variant = "main", project, cluster }) => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { data: replicators = [], error, isLoading } = useReplicators(project);
  const { data: links = [], isLoading: linksLoading } = useClusterLinks();
  const isClustered = useIsClustered();

  const isProjectConfiguration = variant === "project-configuration";
  const isEmptyState = replicators.length === 0 && !isLoading;
  const hasClusterLinks = links.length > 0 && !linksLoading;

  const projectConfigurationInfoNotification = (
    <Notification
      severity="information"
      title="Only outgoing replicators are shown here."
      className="u-no-margin--bottom"
    >
      Incoming replicators are configured on the{" "}
      {cluster ? (
        <>
          replica cluster <ClusterLinkRichChip clusterLink={cluster} />
        </>
      ) : (
        <strong>replica cluster</strong>
      )}
      .
    </Notification>
  );

  if (error) {
    notify.failure("Loading replicators failed", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
    ...(!isProjectConfiguration
      ? [{ content: "Project", sortKey: "project" }]
      : []),
    { content: "Cluster", sortKey: "cluster" },
    { content: "Status", sortKey: "status", className: "status-header" },
    { content: "Last run at", sortKey: "last_run_at" },
    { "aria-label": "Actions", className: "u-align--right actions" },
  ];

  const rows = replicators.map((replicator) => {
    const rowKey = `${replicator.name} ${replicator.project}`;
    return {
      key: rowKey,
      name: rowKey,
      className: "u-row",
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
        ...(!isProjectConfiguration
          ? [
              {
                content: <ProjectRichChip projectName={replicator.project} />,
                role: "cell",
                "aria-label": "Project",
                className: "chip-container",
              },
            ]
          : []),
        {
          content: (
            <ClusterLinkRichChip
              clusterLink={replicator.config?.cluster || "unknown"}
            />
          ),
          role: "cell",
          "aria-label": "Cluster",
          className: "chip-container",
        },
        {
          content: <ReplicatorStatus replicator={replicator} />,
          role: "cell",
          "aria-label": "Status",
          className: "status-cell",
        },
        {
          content: <ReplicatorRunTime replicator={replicator} />,
          role: "cell",
        },
        {
          content: (
            <List
              inline
              className="actions-list"
              items={[
                <RunReplicatorBtn key="run" replicator={replicator} />,
                <EditReplicatorBtn key="edit" replicator={replicator} />,
                <DeleteReplicatorBtn key="delete" replicator={replicator} />,
              ]}
            />
          ),
          role: "cell",
          className: "actions",
        },
      ],
      sortData: {
        name: replicator.name.toLowerCase(),
        description: replicator.description.toLowerCase(),
        project: replicator.project.toLowerCase(),
        cluster: replicator.config?.cluster?.toLowerCase() ?? "",
        status: replicator.last_run_status?.toLowerCase() ?? "",
        last_run_at: replicator.last_run_at
          ? new Date(replicator.last_run_at).getTime()
          : 0,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  const tableContent = (
    <Row>
      {!isEmptyState &&
        (isProjectConfiguration ? (
          <MainTable
            id="replicator-table-id"
            className="replicator-table"
            headers={headers}
            rows={sortedRows}
            sortable
            onUpdateSort={updateSort}
          />
        ) : (
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
        ))}

      {isEmptyState && (
        <ReplicatorListEmptyState
          isProjectConfiguration={isProjectConfiguration}
          projectConfigurationInfoNotification={
            projectConfigurationInfoNotification
          }
          hasClusterLinks={hasClusterLinks}
          isClustered={isClustered}
          docBaseLink={docBaseLink}
          project={project}
          cluster={cluster}
        />
      )}
    </Row>
  );

  const renderLayout = () => {
    if (isProjectConfiguration) {
      return (
        <>
          {!isEmptyState && (
            <div className="u-align--right">
              <CreateReplicatorButton
                appearance="default"
                project={project}
                cluster={cluster}
              />
            </div>
          )}
          {tableContent}
          {!isEmptyState && projectConfigurationInfoNotification}
        </>
      );
    }

    return (
      <BaseLayout
        title={
          <ReplicatorExplanationTooltip>
            Replicators
          </ReplicatorExplanationTooltip>
        }
        controls={
          !isEmptyState && (
            <CreateReplicatorButton className="u-no-margin--bottom" />
          )
        }
      >
        <NotificationRow />
        {tableContent}
      </BaseLayout>
    );
  };

  return (
    <>
      {renderLayout()}
      {panelParams.panel === panels.createReplicator && (
        <CreateReplicatorPanel />
      )}
      {panelParams.panel === panels.editReplicator && <EditReplicatorPanel />}
      <CreateClusterLink />
    </>
  );
};

export default ReplicatorList;
