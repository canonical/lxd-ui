import { type FC } from "react";
import { Spinner } from "@canonical/react-components";
import { type TooltipRow } from "components/RichTooltipRow";
import {
  LARGE_TOOLTIP_BREAKPOINT,
  MEDIUM_TOOLTIP_BREAKPOINT,
  RichTooltipTable,
} from "components/RichTooltipTable";
import { useClusterMember } from "context/useClusterMembers";
import { Link } from "react-router-dom";
import ItemName from "components/ItemName";
import ClusterMemberStatus from "./ClusterMemberStatus";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import ClusterMemberMemoryUsage from "./ClusterMemberMemoryUsage";
import { useQuery } from "@tanstack/react-query";
import { fetchClusterMemberState } from "api/cluster-members";
import { queryKeys } from "util/queryKeys";
import { formatSeconds } from "util/seconds";
import ResourceLabel from "components/ResourceLabel";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  clusterMember: string;
}

const ClusterMemberRichTooltip: FC<Props> = ({ clusterMember }) => {
  const { data: member, isLoading: isMemberLoading } =
    useClusterMember(clusterMember);

  const { data: state } = useQuery({
    queryKey: [
      queryKeys.cluster,
      queryKeys.members,
      member?.server_name ?? undefined,
      queryKeys.state,
    ],
    queryFn: async () => fetchClusterMemberState(member?.server_name ?? ""),
    enabled: !!member,
  });

  if (!member && !isMemberLoading) {
    return (
      <>
        Cluster member{" "}
        <ResourceLabel type="cluster-member" value={clusterMember} /> not found
      </>
    );
  }

  const isAboveMedium = !useIsScreenBelow(MEDIUM_TOOLTIP_BREAKPOINT, "height");

  const isAboveLarge = !useIsScreenBelow(LARGE_TOOLTIP_BREAKPOINT, "height");

  const memberDescription = member?.description || "-";

  const rows: TooltipRow[] = [
    {
      title: "Cluster member",
      value:
        !member || isMemberLoading ? (
          <Spinner />
        ) : (
          <Link
            to={`${ROOT_PATH}/ui/cluster/member/${encodeURIComponent(clusterMember)}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <ItemName item={{ name: clusterMember }} />
          </Link>
        ),
      valueTitle: clusterMember,
    },
    {
      title: "Description",
      value: memberDescription,
      valueTitle: memberDescription,
    },
    {
      title: "Status",
      value: member ? <ClusterMemberStatus member={member} /> : "-",
      valueTitle: member ? member.status : "Status",
    },
    {
      title: "Message",
      value: member ? member.message : "-",
      valueTitle: member ? member.message : "Message",
    },
  ];

  if (isAboveMedium) {
    rows.push(
      {
        title: "URL",
        value: member ? member.url : "-",
        valueTitle: member ? member.url : "URL",
      },
      {
        title: "Roles",
        value: member ? member.roles.join(", ") : "-",
        valueTitle: member ? member.roles.join(", ") : "Roles",
      },
      {
        title: "Uptime",
        value: state?.sysinfo.uptime
          ? formatSeconds(state?.sysinfo.uptime)
          : "-",
      },
      {
        title: "Memory Usage",
        value: member ? <ClusterMemberMemoryUsage member={member} /> : "-",
      },
    );
  }

  if (isAboveLarge) {
    rows.push({
      title: "Load Average",
      value: state?.sysinfo.load_averages.join(" "),
    });
  }

  return <RichTooltipTable rows={rows} />;
};

export default ClusterMemberRichTooltip;
