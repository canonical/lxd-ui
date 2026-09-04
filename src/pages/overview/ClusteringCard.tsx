import { Fragment, type FC } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Icon,
  List,
  MainTable,
  Spinner,
  TablePagination,
} from "@canonical/react-components";
import DsIcon from "components/DsIcon";
import { useClusterMembers } from "context/useClusterMembers";
import { useIsClustered } from "context/useIsClustered";
import { pluralize } from "util/helpers";
import {
  getClusterMemberStatusIconName,
  getClusterLeader,
  getClusterMemberStatusCounts,
} from "util/clusterMember";
import type { LxdClusterMember, LxdClusterMemberStatus } from "types/cluster";
import { ROOT_PATH } from "util/rootPath";
import ClusterMemberStatus from "pages/cluster/ClusterMemberStatus";
import ClusterMemberMemoryUsage from "pages/cluster/ClusterMemberMemoryUsage";
import ClusterMemberCpuUsage from "pages/cluster/ClusterMemberCpuUsage";
import ClusteringTotalResources from "pages/overview/ClusteringTotalResources";
import ClusterMemberExplanationTooltip from "pages/cluster/ClusterMemberExplanationTooltip";
import ServerExplanationTooltip from "pages/cluster/ServerExplanationTooltip";
import { ITEMS_PER_PAGE } from "pages/overview/overviewConstants";

const ClusteringCard: FC = () => {
  const isClustered = useIsClustered();
  const { data: members = [], error, isLoading } = useClusterMembers();

  const getStatusSummary = (members: LxdClusterMember[]) => {
    if (!members.length) {
      return [];
    }

    const countsPerStatus = getClusterMemberStatusCounts(members);
    const listItems = Object.entries(countsPerStatus).map(([status, count]) => (
      <Fragment key={status}>
        <Icon
          name={getClusterMemberStatusIconName(
            status as LxdClusterMemberStatus,
          )}
        />
        {count} {status}
      </Fragment>
    ));

    return listItems;
  };

  const cardClassName = "overview-card clustering";
  const cardTitle = (
    <>
      <span className="overview-card-title">
        <DsIcon icon="cluster-host" /> {isClustered ? "Clustering" : "Server"}
      </span>
      {isClustered ? (
        <ClusterMemberExplanationTooltip />
      ) : (
        <ServerExplanationTooltip />
      )}
    </>
  );

  if (isLoading) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <Spinner
          className="u-loader"
          text={`Loading ${isClustered ? "cluster" : "server"} details...`}
        />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cardClassName} title={cardTitle}>
        <DsIcon icon="error-fill" className="margin-right--large" /> Error while
        loading {isClustered ? "cluster" : "server"} details: {error.message}
      </Card>
    );
  }

  const headers = [
    { content: "Members" },
    { content: "Status" },
    { content: "Memory" },
    { content: "CPU" },
  ];

  const rows = members.map((member) => {
    const rowKey = member.server_name;

    return {
      key: rowKey,
      name: rowKey,
      className: "u-row",
      columns: [
        {
          content: (
            <Link
              to={`${ROOT_PATH}/ui/cluster/member/${encodeURIComponent(
                member.server_name,
              )}`}
              className="u-truncate"
            >
              {member.server_name}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "Member",
          title: `Cluster member ${member.server_name}`,
        },
        {
          content: <ClusterMemberStatus member={member} />,
          "aria-label": "Status",
        },
        {
          content: <ClusterMemberMemoryUsage member={member} />,
          "aria-label": "Memory",
        },
        {
          content: <ClusterMemberCpuUsage member={member} />,
          "aria-label": "CPU",
        },
      ],
    };
  });

  const clusterMembersTable = (
    <MainTable
      className="overview-table"
      aria-label="Cluster members"
      headers={headers}
      rows={members.length > ITEMS_PER_PAGE ? undefined : rows}
      responsive
    />
  );

  return (
    <Card className={cardClassName} title={cardTitle}>
      {isClustered && (
        <List
          inline
          middot
          items={[
            `${members.length} ${pluralize("member", members.length)}`,
            `leader: ${getClusterLeader(members)?.server_name ?? "-"}`,
            ...getStatusSummary(members),
          ]}
        />
      )}

      <ClusteringTotalResources />

      {isClustered &&
        (members.length > ITEMS_PER_PAGE ? (
          <TablePagination
            id="cluster-members-pagination"
            data={rows}
            pageLimits={[ITEMS_PER_PAGE]}
            itemName="cluster member"
            position="below"
            className="u-no-margin--bottom"
            aria-label="Cluster members pagination control"
          >
            {clusterMembersTable}
          </TablePagination>
        ) : (
          clusterMembersTable
        ))}

      <div className="card-footer">
        <Link
          to={`${ROOT_PATH}/ui/cluster/${isClustered ? "members" : "server"}`}
        >
          {isClustered ? "Clustering details" : "Server details"}
        </Link>
      </div>
    </Card>
  );
};

export default ClusteringCard;
