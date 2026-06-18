import { type FC } from "react";
import { Spinner } from "@canonical/react-components";
import { type TooltipRow } from "components/RichTooltipRow";
import { RichTooltipTable } from "components/RichTooltipTable";
import { Link } from "react-router-dom";
import ItemName from "components/ItemName";
import ResourceLabel from "components/ResourceLabel";
import { ROOT_PATH } from "util/rootPath";
import { useReplicator } from "context/useReplicators";
import ClusterLinkStatus from "./ClusterLinkStatus";
import { useClusterLink } from "context/useClusterLinks";
import { useIsClustered } from "context/useIsClustered";
import ReplicatorRunTime from "./ReplicatorRunTime";
import ReplicatorStatus from "./ReplicatorStatus";
import ReplicatorSnapshotDescription from "./ReplicatorSnapshotDescription";
import ResourceLink from "components/ResourceLink";
import { getClusterLinkListUrl } from "util/clusterLink";

interface Props {
  replicatorName: string;
  project: string;
}

const ReplicatorRichTooltip: FC<Props> = ({ replicatorName, project }) => {
  const { data: replicator, isLoading } = useReplicator(
    replicatorName,
    project,
  );
  const isClustered = useIsClustered();

  const isEnabled = !!replicator && !!replicator.config?.cluster;
  const { data: link } = useClusterLink(
    replicator?.config.cluster || "",
    isEnabled,
  );

  if (!replicator && !isLoading) {
    return (
      <>
        Replicator <ResourceLabel type="replicator" value={replicatorName} />{" "}
        not found
      </>
    );
  }

  const rows: TooltipRow[] = [
    {
      title: "Replicator",
      value:
        !replicator || isLoading ? (
          <Spinner />
        ) : (
          <Link
            to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/replicator/${encodeURIComponent(replicatorName)}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <ItemName item={{ name: replicatorName }} />
          </Link>
        ),
      valueTitle: replicatorName,
    },
    {
      title: "Description",
      value: replicator?.description || "-",
      valueTitle: replicator?.description || "",
    },
    {
      title: "Source project",
      value: replicator ? (
        <ResourceLink
          type="project"
          value={replicator.project}
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(replicator.project)}/configuration/replication`}
        />
      ) : (
        "-"
      ),
      valueTitle: replicator?.project || "",
    },
    {
      title: "Cluster",
      value: replicator ? (
        <ResourceLink
          type="cluster-link"
          value={replicator.config.cluster}
          to={getClusterLinkListUrl(isClustered)}
        />
      ) : (
        "-"
      ),
      valueTitle: replicator?.config?.cluster || "",
    },
    {
      title: "Cluster status",
      value: link ? <ClusterLinkStatus link={link} /> : "-",
      className: "status-row",
    },
    {
      title: "Snapshots",
      value: replicator ? (
        <ReplicatorSnapshotDescription replicator={replicator} />
      ) : (
        "-"
      ),
    },
    {
      title: "Schedule",
      value: replicator?.config?.schedule || "-",
      valueTitle: replicator?.config?.schedule || "",
    },
    {
      title: "Last run at",
      value: replicator ? <ReplicatorRunTime replicator={replicator} /> : "-",
    },
    {
      title: "Status",
      value: replicator ? <ReplicatorStatus replicator={replicator} /> : "-",
      className: "status-row",
    },
  ];

  return (
    <RichTooltipTable rows={rows} className="replicator-rich-tooltip-table" />
  );
};

export default ReplicatorRichTooltip;
