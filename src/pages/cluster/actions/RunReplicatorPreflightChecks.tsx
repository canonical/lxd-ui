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
import { pluralize } from "util/helpers";

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

  const projectMode = project?.config?.["replica.mode"];
  const projectModeValid =
    projectMode === "leader" || projectMode === "standby";
  checks.push({
    id: "project-mode",
    label: projectMode ? (
      <>
        Project{" "}
        <ProjectRichChip
          projectName={replicator.project}
          urlSuffix="/configuration/replication"
        />{" "}
        is in <strong>{projectMode}</strong> mode
      </>
    ) : (
      <>
        Project{" "}
        <ProjectRichChip
          projectName={replicator.project}
          urlSuffix="/configuration/replication"
        />{" "}
        <strong>replica mode</strong> is unset
      </>
    ),
    status: isProjectLoading ? "loading" : projectModeValid ? "pass" : "fail",
    message:
      !isProjectLoading && !projectModeValid ? (
        <>
          {projectMode ? (
            <>
              The project replica mode <strong>{projectMode}</strong> is
              invalid.
            </>
          ) : null}{" "}
          It must be either <strong>leader</strong> or <strong>standby</strong>{" "}
          to run replicator.{" "}
          <Link
            to={`/ui/project/${encodeURIComponent(replicator.project)}/configuration/replication`}
            target="_blank"
            rel="noopener noreferrer"
          >
            See project configuration
          </Link>
        </>
      ) : undefined,
  });

  const projectCluster = project?.config?.["replica.cluster"];
  const replicatorCluster = replicator.config?.cluster;
  const clusterMatches = projectCluster === replicatorCluster;
  checks.push({
    id: "replica-cluster-match",
    label: (
      <>
        Project{" "}
        <ProjectRichChip
          projectName={project?.name || "default"}
          urlSuffix="/configuration/replication"
        />{" "}
        <strong>replica cluster</strong> configuration matches replicator
        cluster
      </>
    ),
    status: isProjectLoading ? "loading" : clusterMatches ? "pass" : "fail",
    message:
      !isProjectLoading && !clusterMatches ? (
        <>
          Project replica cluster <strong>{projectCluster || "none"}</strong>{" "}
          does not equal replicator cluster{" "}
          <strong>{replicatorCluster || "none"}</strong>.{" "}
          <Link
            to={`/ui/project/${encodeURIComponent(replicator.project)}/configuration/replication`}
            target="_blank"
            rel="noopener noreferrer"
          >
            See project configuration
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
        ? `Cluster link status is '${clusterLinkStatus}' but must be 'Reachable' to run replicator. Ensure both clusters are online, can reach each other over the network, and the link is configured bi-directionally.`
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
          ? `${runningInstances.length} running ${pluralize(
              "instance",
              runningInstances.length,
            )} in the project. Stop ${runningInstances.length > 1 ? "them" : "it"} to allow restore.`
          : undefined,
    });
  }

  const allChecksPassed = checks.every((check) => check.status === "pass");
  const isAnyCheckLoading = checks.some((check) => check.status === "loading");

  useEffect(() => {
    onValidationChange(allChecksPassed && !isAnyCheckLoading);
  }, [allChecksPassed, isAnyCheckLoading, onValidationChange]);

  return (
    <List
      items={checks.map((check) => (
        <RunReplicatorPreflightCheckRow key={check.id} check={check} />
      ))}
      className="u-no-margin--bottom"
    ></List>
  );
};

export default RunReplicatorPreflightChecks;
