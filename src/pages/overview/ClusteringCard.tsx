import type { FC } from "react";
import { Link } from "react-router-dom";
import { Card, Icon, MainTable, Spinner } from "@canonical/react-components";
import ListPipe from "components/ListPipe";
import { useClusterMembers } from "context/useClusterMembers";
import { useIsClustered } from "context/useIsClustered";
import { useSettings } from "context/useSettings";
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
import ClusterMemberStorageUsage from "pages/cluster/ClusterMemberStorageUsage";
import ClusteringTotalResources from "pages/overview/ClusteringTotalResources";

const ClusteringCard: FC = () => {
  const isClustered = useIsClustered();
  const { data: settings } = useSettings();
  const serverName = settings?.environment?.server_name;
  const { data: members = [], error, isLoading } = useClusterMembers();

  const getStatusSummary = (members: LxdClusterMember[]) => {
    if (!members.length) {
      return null;
    }

    const countsPerStatus = getClusterMemberStatusCounts(members);
    const listItems = Object.entries(countsPerStatus).map(([status, count]) => (
      <>
        <Icon
          name={getClusterMemberStatusIconName(
            status as LxdClusterMemberStatus,
          )}
        />
        {count} {status}
      </>
    ));

    return <ListPipe items={listItems} />;
  };

  const cardClassName = "overview-card clustering";
  const cardTitle = (
    <>
      <Icon name="cluster-host" /> {isClustered ? "Clustering" : "Server"}
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
        <Icon name="error" className="margin-right--large" /> Error while
        loading cluster details: {error.message}
      </Card>
    );
  }

  const headers = [
    { content: "Members" },
    { content: "Status" },
    { content: "Memory" },
    { content: "CPU" },
    { content: "Storage" },
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
        {
          content: <ClusterMemberStorageUsage member={member} />,
          "aria-label": "Storage",
        },
      ],
    };
  });

  const subtitleItems = isClustered
    ? [
        `Current: ${serverName}`,
        `${members.length} ${pluralize("member", members.length)}`,
        `Leader: ${getClusterLeader(members)?.server_name ?? "-"}`,
        getStatusSummary(members),
      ]
    : [`Server: ${serverName}`, "Standalone"];

  return (
    <Card className={cardClassName} title={cardTitle}>
      <p className="u-text--muted u-text--small">
        <ListPipe items={subtitleItems} />
      </p>

      <ClusteringTotalResources />

      {isClustered && (
        <MainTable
          className="cluster-members-table"
          aria-label="Cluster members"
          headers={headers}
          rows={rows}
        />
      )}

      <div className="card-footer">
        <Link
          to={`${ROOT_PATH}/ui/cluster/${isClustered ? "members" : "server"}`}
        >
          See more
        </Link>
      </div>
    </Card>
  );
};

export default ClusteringCard;
