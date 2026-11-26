import { useEffect, type FC } from "react";
import { Spinner, useNotify } from "@canonical/react-components";
import ExplanationTooltip from "components/ExplanationTooltip";
import { useClusterLink } from "context/useClusterLinks";
import { useInstances } from "context/useInstances";
import { useProject } from "context/useProjects";
import { useStoragePools } from "context/useStoragePools";
import ClusterLinkRichChip from "pages/cluster/ClusterLinkRichChip";
import ClusterLinkStatus from "pages/cluster/ClusterLinkStatus";
import type { LxdReplicator } from "types/replicator";
import { capitalizeFirstLetter, LxdApiError } from "util/helpers";
import { isCephMirrored } from "util/replicator";

interface Props {
  replicator: LxdReplicator;
}

const ReplicatorGeneral: FC<Props> = ({ replicator }) => {
  const notify = useNotify();
  const {
    data: project,
    error: projectError,
    isLoading: isProjectLoading,
  } = useProject(replicator.project);
  const linkName = replicator.config.cluster;
  const {
    data: clusterLink,
    error: linkError,
    isLoading: isLinkLoading,
  } = useClusterLink(linkName);
  const {
    data: pools,
    error: poolsError,
    isLoading: isPoolsLoading,
  } = useStoragePools();
  const {
    data: instances,
    error: instancesError,
    isLoading: isInstancesLoading,
  } = useInstances(replicator.project);

  // A deleted link shows "-" instead of an error.
  const isLinkMissing =
    linkError instanceof LxdApiError && linkError.status === 404;

  useEffect(() => {
    if (projectError) {
      notify.failure("Loading project failed", projectError);
    } else if (linkError && !isLinkMissing) {
      notify.failure("Loading cluster link failed", linkError);
    } else if (poolsError) {
      notify.failure("Loading storage pools failed", poolsError);
    } else if (instancesError) {
      notify.failure("Loading instances failed", instancesError);
    }
  }, [projectError, linkError, poolsError, instancesError]);

  const replicaMode = project?.replica_mode;
  const unknown = <span className="u-text--muted">Unknown</span>;

  const getReplicaMode = () => {
    if (isProjectLoading) {
      return <Spinner />;
    }
    if (projectError) {
      return unknown;
    }
    return replicaMode ? capitalizeFirstLetter(replicaMode) : "-";
  };

  const getLinkStatus = () => {
    if (isLinkLoading) {
      return <Spinner className="status-spinner" />;
    }
    if (!clusterLink) {
      return isLinkMissing ? "-" : unknown;
    }
    return <ClusterLinkStatus link={clusterLink} subject="Target cluster" />;
  };

  const getCephMirroring = () => {
    if (isPoolsLoading || isInstancesLoading) {
      return <Spinner />;
    }
    if (!pools || !instances) {
      return unknown;
    }
    const isMirrored = isCephMirrored(pools, instances, replicator.project);
    if (isMirrored === undefined) {
      return unknown;
    }
    if (!isMirrored) {
      return "Not configured";
    }
    return (
      <>
        <div>Yes</div>
        <div className="u-text--muted">
          Replication completes only after the secondary cluster&apos;s Ceph
          cluster has received the data.
        </div>
      </>
    );
  };

  return (
    <table className="replicator-general p-table--mobile-card">
      <thead>
        <tr>
          <th>Project replication mode</th>
          <th className="status-header">Cluster link used</th>
          <th>Description</th>
          <th>Schedule</th>
          <th>
            <ExplanationTooltip
              explanation="Ceph RBD mirroring connects two Ceph clusters by a dedicated high-speed, low-latency link. To enable, set up Ceph RBD mirroring on all pools in this project on both clusters."
              docPath="/explanation/disaster_recovery/#replicators-with-ceph-rbd-mirroring"
              docLabel="Learn more about Ceph RBD mirroring in the docs"
            >
              Ceph RBD mirroring
            </ExplanationTooltip>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td data-heading="Project replication mode">{getReplicaMode()}</td>
          <td data-heading="Cluster link used">
            {linkName ? (
              <>
                <div className="u-flex cluster-link-chip">
                  <ClusterLinkRichChip clusterLink={linkName} />
                </div>
                <div
                  className={
                    isLinkLoading || clusterLink ? "status-cell" : "link-status"
                  }
                >
                  {getLinkStatus()}
                </div>
              </>
            ) : (
              <div className="link-status">-</div>
            )}
          </td>
          <td data-heading="Description">
            {replicator.description ? (
              <div className="u-truncate" title={replicator.description}>
                {replicator.description}
              </div>
            ) : (
              "-"
            )}
          </td>
          <td data-heading="Schedule">{replicator.config.schedule || "-"}</td>
          <td data-heading="Ceph RBD mirroring">{getCephMirroring()}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default ReplicatorGeneral;
