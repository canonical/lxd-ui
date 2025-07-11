import type { FC } from "react";
import {
  MainTable,
  Row,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { fetchClusterMembers } from "api/cluster";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import useSortTableData from "util/useSortTableData";
import usePanelParams, { panels } from "util/usePanelParams";
import EditClusterMemberPanel from "pages/cluster/panels/EditClusterMemberPanel";
import { Link } from "react-router-dom";
import ResourceLink from "components/ResourceLink";
import ClusterMemberActions from "pages/cluster/ClusterMemberActions";
import AddClusterMemberBtn from "pages/cluster/actions/AddClusterMemberBtn";

const ClusterMemberList: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const panelParams = usePanelParams();

  const {
    data: members = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members],
    queryFn: fetchClusterMembers,
  });

  if (error) {
    notify.failure("Loading cluster members failed", error);
  }

  const headers = [
    {
      content: (
        <>
          Name
          <br />
          <div className="header-second-row">Url</div>
        </>
      ),
      className: "name",
    },
    { content: "Roles", sortKey: "roles", className: "roles" },
    {
      content: (
        <>
          Architecture
          <br />
          <div className="header-second-row">Failure domain</div>
        </>
      ),
      className: "architecture",
    },
    {
      content: "Description",
      sortKey: "description",
      className: "description",
    },
    { content: "Groups" },
    {
      content: (
        <>
          Status
          <br />
          <div className="header-second-row">Message</div>
        </>
      ),
      className: "status",
    },
    { "aria-label": "Action", className: "u-align--right actions" },
  ];

  const rows = members.map((member) => {
    return {
      key: member.server_name,
      name: member.server_name,
      columns: [
        {
          content: (
            <>
              <div>
                <Link
                  to={`/ui/cluster/member/${encodeURIComponent(member.server_name)}`}
                >
                  {member.server_name}
                </Link>
              </div>
              <div className="u-text--muted">{member.url}</div>
            </>
          ),
          role: "rowheader",
          "aria-label": "Name and url",
          className: "name",
        },
        {
          content: member.roles.join(", "),
          role: "cell",
          "aria-label": "Roles",
          className: "roles",
        },
        {
          content: (
            <>
              <div>{member.architecture}</div>
              <div className="u-text--muted">{member.failure_domain}</div>
            </>
          ),
          role: "cell",
          "aria-label": "Architecture and failure domain",
          className: "architecture",
        },
        {
          content: member.description,
          role: "cell",
          "aria-label": "Description",
          className: "description",
        },
        {
          content: member.groups?.map((group) => (
            <ResourceLink
              type="cluster-group"
              value={group}
              to="/ui/cluster/groups"
              key={group}
            />
          )),
          role: "cell",
          "aria-label": "Groups",
        },
        {
          content: (
            <>
              <div>{member.status}</div>
              <div className="u-text--muted">{member.message}</div>
            </>
          ),
          role: "cell",
          "aria-label": "Status and message",
          className: "status",
        },
        {
          content: <ClusterMemberActions member={member} />,
          role: "cell",
          className: "u-align--right actions",
          "aria-label": "Action",
        },
      ],
      sortData: {
        roles: member.roles,
        description: member.description,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  return (
    <>
      <BaseLayout
        mainClassName="cluster-list"
        contentClassName="cluster-content"
        title={
          <HelpLink
            href={`${docBaseLink}/explanation/clustering/`}
            title="Learn more about clustering"
          >
            Cluster members
          </HelpLink>
        }
        controls={<AddClusterMemberBtn />}
      >
        <NotificationRow />
        <Row>
          <ScrollableTable
            dependencies={[members, notify.notification]}
            tableId="cluster-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              data={sortedRows}
              id="pagination"
              itemName="cluster member"
              className="u-no-margin--top"
              aria-label="Table pagination control"
            >
              <MainTable
                id="cluster-table"
                headers={headers}
                sortable
                onUpdateSort={updateSort}
                emptyStateMsg={
                  isLoading && <Loader text="Loading cluster members..." />
                }
              />
            </TablePagination>
          </ScrollableTable>
        </Row>
      </BaseLayout>
      {panelParams.panel === panels.editClusterMember && (
        <EditClusterMemberPanel />
      )}
    </>
  );
};

export default ClusterMemberList;
