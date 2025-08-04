import type { FC } from "react";
import {
  Button,
  MainTable,
  Row,
  ScrollableTable,
  TablePagination,
  useNotify,
  Spinner,
} from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import useSortTableData from "util/useSortTableData";
import { Link } from "react-router-dom";
import ClusterMemberActions from "pages/cluster/ClusterMemberActions";
import { useClusterMembers } from "context/useClusterMembers";
import usePanelParams from "util/usePanelParams";
import ClusterMemberStatus from "pages/cluster/ClusterMemberStatus";
import { useMemberLoading } from "context/memberLoading";

const ClusterMemberList: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { data: members = [], error, isLoading } = useClusterMembers();
  const memberLoading = useMemberLoading();

  if (error) {
    notify.failure("Loading cluster members failed", error);
  }

  const headers = [
    {
      content: "Name",
      className: "name",
      sortKey: "name",
    },
    {
      content: <span className="status-header">Status</span>,
      className: "status",
      sortKey: "status",
    },
    { content: "Roles", sortKey: "roles", className: "roles" },
    {
      content: "Failure domain",
      className: "failure-domain",
      sortKey: "failureDomain",
    },
    {
      content: "Description",
      sortKey: "description",
      className: "description",
    },
    {
      content: "Groups",
      className: "groups u-align--right",
      sortKey: "groups",
    },
    { "aria-label": "Action", className: "u-align--right actions" },
  ];

  const rows = members.map((member) => {
    const groupCount = (member.groups ?? []).length;
    const openMemberEdit = () => {
      panelParams.openEditMember(member.server_name);
    };
    const loadingType = memberLoading.getType(member.server_name);

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
          content: (
            <>
              <div>
                <ClusterMemberStatus member={member} />
              </div>
              <div className="u-text--muted status-header">
                {loadingType ? "In progress" : member.message}
              </div>
            </>
          ),
          role: "cell",
          "aria-label": "Status",
          className: "status",
        },
        {
          content: member.roles.join(", "),
          role: "cell",
          "aria-label": "Roles",
          className: "roles",
        },
        {
          content: member.failure_domain,
          role: "cell",
          "aria-label": "Failure domain",
          className: "failure-domain",
        },
        {
          content: member.description,
          role: "cell",
          "aria-label": "Description",
          className: "description",
        },
        {
          content: (
            <Button appearance="link" dense onClick={openMemberEdit}>
              {groupCount}
            </Button>
          ),
          role: "cell",
          className: "groups u-align--right",
          "aria-label": "Groups",
        },
        {
          content: <ClusterMemberActions member={member} />,
          role: "cell",
          className: "u-align--right actions",
          "aria-label": "Action",
        },
      ],
      sortData: {
        name: member.server_name.toLowerCase(),
        status: member.status.toLowerCase(),
        failureDomain: member.failure_domain.toLowerCase(),
        roles: member.roles,
        description: member.description?.toLowerCase(),
        groups: groupCount,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  return (
    <BaseLayout
      mainClassName="cluster-list"
      title={
        <HelpLink
          href={`${docBaseLink}/explanation/clustering/`}
          title="Learn more about clustering"
        >
          Cluster members
        </HelpLink>
      }
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
              responsive
              onUpdateSort={updateSort}
              emptyStateMsg={
                isLoading && (
                  <Spinner
                    className="u-loader"
                    text="Loading cluster members..."
                  />
                )
              }
            />
          </TablePagination>
        </ScrollableTable>
      </Row>
    </BaseLayout>
  );
};

export default ClusterMemberList;
