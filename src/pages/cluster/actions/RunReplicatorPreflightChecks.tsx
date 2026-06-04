import { useEffect, type FC } from "react";
import { Link } from "react-router";
import { List } from "@canonical/react-components";
import { useClusterLinkState } from "context/useClusterLinks";
import { useIdentities } from "context/useIdentities";
import { useInstances } from "context/useInstances";
import { useProject } from "context/useProjects";
import ClusterLinkRichChip from "pages/cluster/ClusterLinkRichChip";
import RunReplicatorPreflightCheckRow, {
  type PreflightCheck,
} from "pages/cluster/actions/RunReplicatorPreflightCheckRow";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import type { LxdReplicator } from "types/replicator";
import { getClusterLinksStatus, getLinkIdentity } from "util/clusterLink";

interface Props {
  replicator: LxdReplicator;
  onValidationChange: (isValid: boolean) => void;
  isRestore?: boolean;
}

const RunReplicatorPreflightChecks: FC<Props> = ({
  replicator,
  onValidationChange,
  isRestore = false,
}) => {
  const { data: project, isLoading: isProjectLoading } = useProject(
    replicator.project,
  );
  const { data: instances, isLoading: isInstancesLoading } = useInstances(
    replicator.project,
  );
  const { data: identities = [] } = useIdentities();
  const { data: clusterLinkState, isLoading: isClusterLinkStateLoading } =
    useClusterLinkState(replicator.config?.cluster || "");
  const identity = getLinkIdentity(identities, replicator.config?.cluster);

  const checks: PreflightCheck[] = [];

  const projectCluster = project?.config?.["replica.cluster"];
  const replicatorCluster = replicator.config?.cluster;
  const clusterMatches = projectCluster === replicatorCluster;
  checks.push({
    id: "replica-cluster-match",
    label: (
      <>
        Replicator cluster matches the project{" "}
        <ProjectRichChip projectName={project?.name || "default"} /> replica
        cluster
      </>
    ),
    status: isProjectLoading ? "loading" : clusterMatches ? "pass" : "fail",
    message:
      !isProjectLoading && !clusterMatches ? (
        <>
          Project cluster <strong>{projectCluster || "none"}</strong> must match
          replicator cluster <strong>{replicatorCluster || "none"}</strong>.{" "}
          <Link
            to={`/ui/project/${encodeURIComponent(replicator.project)}/configuration`}
          >
            Update the project configuration
          </Link>
        </>
      ) : undefined,
  });

  const clusterLinkStatus = getClusterLinksStatus(identity, clusterLinkState);
  const isReachable = clusterLinkStatus === "Reachable";

  checks.push({
    id: "cluster-link-reachable",
    label: (
      <>
        Cluster link{" "}
        <ClusterLinkRichChip clusterLink={replicator.config?.cluster} /> is
        reachable
      </>
    ),
    status: isClusterLinkStateLoading
      ? "loading"
      : isReachable
        ? "pass"
        : "fail",
    message:
      !isClusterLinkStateLoading && !isReachable
        ? `The cluster link connection state is '${clusterLinkStatus}'. It must be Reachable.`
        : undefined,
  });

  if (isRestore) {
    const runningInstances =
      instances?.filter(
        (inst) =>
          inst.project === replicator.project && inst.status === "Running",
      ) || [];
    const allInstancesStopped = runningInstances.length === 0;

    checks.push({
      id: "instances-stopped",
      label: (
        <>
          All instances in the project{" "}
          <ProjectRichChip projectName={replicator.project} /> are stopped
        </>
      ),
      status: isInstancesLoading
        ? "loading"
        : allInstancesStopped
          ? "pass"
          : "fail",
      message:
        !isInstancesLoading && !allInstancesStopped
          ? `${runningInstances.length} active instance(s) running in this project namespace. Stop them to prevent data drift during sync.`
          : undefined,
    });
  }

  const allChecksPassed = checks.every((check) => check.status === "pass");
  const isAnyCheckLoading = checks.some((check) => check.status === "loading");

  useEffect(() => {
    onValidationChange(allChecksPassed && !isAnyCheckLoading);
  }, [allChecksPassed, isAnyCheckLoading, onValidationChange]);

  return (
    <>
      <p>
        <strong>Preflight checks:</strong>
      </p>
      <List
        items={checks.map((check) => (
          <RunReplicatorPreflightCheckRow key={check.id} check={check} />
        ))}
      ></List>
    </>
  );
};

export default RunReplicatorPreflightChecks;
