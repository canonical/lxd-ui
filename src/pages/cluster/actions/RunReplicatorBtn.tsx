import { useState, type FC } from "react";
import {
  ConfirmationButton,
  Icon,
  Notification,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { runReplicator } from "api/replicators";
import classnames from "classnames";
import ConfirmationCheckbox from "components/ConfirmationCheckbox";
import ResourceLink from "components/ResourceLink";
import { useReplicatorLoading } from "context/replicatorLoading";
import { useProject } from "context/useProjects";
import { useEventQueue } from "context/eventQueue";
import RunReplicatorPreflightChecks from "pages/cluster/actions/RunReplicatorPreflightChecks";
import ClusterLinkRichChip from "pages/cluster/ClusterLinkRichChip";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import type { LxdReplicator } from "types/replicator";
import { useReplicatorEntitlements } from "util/entitlements/replicators";
import { pluralize } from "util/helpers";
import {
  getInstancesUsedByProject,
  isProjectReplicaModeStandby,
} from "util/projects";
import { queryKeys } from "util/queryKeys";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  replicator: LxdReplicator;
  className?: string;
  hasLabel?: boolean;
  onClose?: () => void;
}

const RunReplicatorBtn: FC<Props> = ({
  replicator,
  className,
  hasLabel = false,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const replicatorLoading = useReplicatorLoading();
  const [isLoading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const { canEditReplicator } = useReplicatorEntitlements();
  const { data: project, isLoading: isProjectLoading } = useProject(
    replicator.project,
  );
  const [isOverwriteConfirmed, setIsOverwriteConfirmed] = useState(false);

  const clusterLink = replicator.config.cluster;
  const isRestore = isProjectReplicaModeStandby(project);
  const buttonLabel = isRestore ? "Restore" : "Run";
  const hasPermission = canEditReplicator(replicator);
  const numberOfInstances = project
    ? getInstancesUsedByProject(project).length
    : 0;

  const disabledReason = () => {
    if (!hasPermission) {
      return "You do not have permission to run this replicator";
    }
    if (isLoading) {
      return "Replicator is starting...";
    }
    if (replicatorLoading.getStatus(replicator) === "Running") {
      return "This replicator is currently running";
    }
    return undefined;
  };

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[2] === queryKeys.replicators,
    });
  };

  const onReplicationStarted = () => {
    setLoading(false);
    replicatorLoading.clearLastRunError(replicator);
    replicatorLoading.setRunning(replicator);
    invalidateCache();

    toastNotify.info(
      <>
        Replicator{" "}
        <ResourceLink
          type="replicator"
          value={replicator.name}
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(replicator.project)}/replicator/${encodeURIComponent(replicator.name)}`}
        />{" "}
        started.
      </>,
    );
  };

  const onReplicatorStartFailure = (e: unknown) => {
    setLoading(false);
    replicatorLoading.setFinish(replicator);
    invalidateCache();
    toastNotify.failure(`Running replicator ${replicator.name} failed`, e);
  };

  const onOperationSuccess = () => {
    replicatorLoading.setFinish(replicator);
    replicatorLoading.clearLastRunError(replicator);
    toastNotify.success(
      <>
        Replicator{" "}
        <ResourceLink
          type="replicator"
          value={replicator.name}
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(replicator.project)}/replicator/${encodeURIComponent(replicator.name)}`}
        />{" "}
        completed successfully.
      </>,
    );
    invalidateCache();
  };

  const onOperationFailure = (msg: string) => {
    replicatorLoading.setFinish(replicator);
    replicatorLoading.setLastRunError(replicator, msg);
    invalidateCache();
    toastNotify.failure(
      `Replicator${replicator.name} failed while running`,
      new Error(msg),
    );
  };

  const handleRun = () => {
    setLoading(true);
    runReplicator(
      replicator.name,
      replicator.project,
      isRestore ? "restore" : "start",
    )
      .then((response) => {
        onReplicationStarted();
        eventQueue.set(
          response.metadata.id,
          onOperationSuccess,
          onOperationFailure,
          invalidateCache,
        );
      })
      .catch(onReplicatorStartFailure);
  };

  return (
    <ConfirmationButton
      type="button"
      onHoverText={disabledReason()}
      appearance={hasLabel ? "default" : "base"}
      className={classnames("u-no-margin has-icon", className, {
        "is-dense": !hasLabel,
      })}
      loading={isLoading || isProjectLoading}
      confirmationModalProps={{
        className: "run-replicator-modal",
        title: (
          <>
            {isRestore ? "Restore" : "Run"} replicator{" "}
            <ResourceLink
              type="replicator"
              value={replicator.name}
              to={`${ROOT_PATH}/ui/project/${encodeURIComponent(replicator.project)}/replicator/${encodeURIComponent(replicator.name)}`}
            />
          </>
        ),
        children: (
          <>
            <RunReplicatorPreflightChecks
              replicator={replicator}
              onValidationChange={(isValid) => {
                setCanSubmit(isValid);
              }}
              isRestore={isRestore}
            />

            <div
              className={classnames("replicator-data-flow u-hide--small", {
                "replicator-data-flow--restore": isRestore,
              })}
            >
              <div className="replicator-data-flow__node replicator-data-flow__source">
                <span className="node-heading u-text--muted">
                  {isRestore ? "standby" : "leader"} project (local)
                </span>
                <ProjectRichChip
                  projectName={replicator.project}
                  urlSuffix="/configuration/replication"
                />
              </div>
              <div className="replicator-data-flow__arrow-shaft">
                <ClusterLinkRichChip clusterLink={clusterLink} />
              </div>
              <div className="replicator-data-flow__node replicator-data-flow__target">
                <span className="node-heading u-text--muted">
                  {isRestore ? "leader" : "standby"} project (remote)
                </span>
                <strong className="mono-font">{replicator.project}</strong>
              </div>
            </div>

            {isRestore ? (
              <p>
                This will sync all instances from the{" "}
                <ClusterLinkRichChip clusterLink={clusterLink} /> cluster back
                to the{" "}
                <ProjectRichChip
                  projectName={replicator.project}
                  urlSuffix="/configuration/replication"
                />{" "}
                project.
              </p>
            ) : (
              <p>
                This will sync {numberOfInstances}{" "}
                {pluralize("instance", numberOfInstances)} from the source
                project <ProjectRichChip projectName={replicator.project} /> to
                the standby cluster{" "}
                <ClusterLinkRichChip clusterLink={clusterLink} />.
              </p>
            )}

            {isRestore && (
              <Notification
                severity="caution"
                messageElement="div"
                title="All local data will be overwritten by the remote version"
              >
                <p>
                  {numberOfInstances} instances in local project{" "}
                  <ProjectRichChip projectName={replicator.project} /> will be
                  permanently replaced by the version fetched from the remote
                  cluster. This cannot be undone.
                </p>
              </Notification>
            )}
          </>
        ),
        onConfirm: handleRun,
        confirmButtonLabel: buttonLabel,
        confirmButtonProps: {
          type: "button",
        },
        cancelButtonProps: {
          type: "button",
        },
        confirmButtonDisabled:
          !canSubmit || isLoading || (isRestore && !isOverwriteConfirmed),
        close: onClose,
        confirmExtra: isRestore ? (
          <ConfirmationCheckbox
            label="Overwrite local data"
            confirmed={[isOverwriteConfirmed, setIsOverwriteConfirmed]}
            disabled={!canSubmit || isLoading}
          />
        ) : undefined,
      }}
      disabled={Boolean(disabledReason())}
    >
      <Icon name="play" />
      {hasLabel && <span>{buttonLabel}</span>}
    </ConfirmationButton>
  );
};

export default RunReplicatorBtn;
