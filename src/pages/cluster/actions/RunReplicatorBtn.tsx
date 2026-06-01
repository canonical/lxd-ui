import { useState, type FC } from "react";
import {
  ConfirmationButton,
  Icon,
  Notification,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { runReplicator } from "api/replicators";
import classnames from "classnames";
import ResourceLink from "components/ResourceLink";
import { useProject } from "context/useProjects";
import { useEventQueue } from "context/eventQueue";
import ClusterLinkRichChip from "pages/cluster/ClusterLinkRichChip";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import type { LxdReplicator } from "types/replicator";
import { useReplicatorEntitlements } from "util/entitlements/replicators";
import { isProjectReplicaModeStandby } from "util/projects";
import { queryKeys } from "util/queryKeys";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  replicator: LxdReplicator;
  className?: string;
  onClose?: () => void;
}

const RunReplicatorBtn: FC<Props> = ({ replicator, className, onClose }) => {
  const queryClient = useQueryClient();
  const eventQueue = useEventQueue();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const { canEditReplicator } = useReplicatorEntitlements();
  const { data: project, isLoading: isProjectLoading } = useProject(
    replicator.project,
  );
  const clusterLink = replicator.config.cluster;
  const isReverseFlow = isProjectReplicaModeStandby(project);
  const buttonLabel = isReverseFlow ? "Restore" : "Run";

  const disabledReason = () => {
    if (!canEditReplicator(replicator)) {
      return "You do not have permission to run this replicator";
    }

    if (isLoading) {
      // Request was sent, waiting for a response
      return "Replicator is starting...";
    }

    if (replicator.last_run_status === "Running") {
      return "This replicator is currently running";
    }

    return undefined;
  };

  const notifySuccess = (replicatorName: string) => {
    toastNotify.success(
      <>
        Replicator{" "}
        <ResourceLink
          type="replicator"
          value={replicatorName}
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(replicator.project)}/replicator/${encodeURIComponent(replicatorName)}`}
        />{" "}
        started.
      </>,
    );
  };

  const markReplicatorRunning = () => {
    const detailQueryKey = [
      queryKeys.projects,
      replicator.project,
      queryKeys.replicators,
      replicator.name,
    ];

    queryClient.setQueryData<LxdReplicator>(
      detailQueryKey,
      (currentReplicator) => {
        if (!currentReplicator) {
          return currentReplicator;
        }

        return {
          ...currentReplicator,
          last_run_status: "Running",
          last_run_error: undefined,
        };
      },
    );

    const listQueryKey = [
      queryKeys.projects,
      replicator.project,
      queryKeys.replicators,
    ];
    queryClient.setQueryData<LxdReplicator[]>(
      listQueryKey,
      (currentReplicators) => {
        if (!currentReplicators) {
          return currentReplicators;
        }

        return currentReplicators.map((currentReplicator) =>
          currentReplicator.name === replicator.name
            ? {
                ...currentReplicator,
                last_run_status: "Running",
                last_run_error: undefined,
              }
            : currentReplicator,
        );
      },
    );
  };

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[2] === queryKeys.replicators,
    });
  };

  const storeRunError = (errorMsg?: string) => {
    const detailQueryKey = [
      queryKeys.projects,
      replicator.project,
      queryKeys.replicators,
      replicator.name,
    ];

    queryClient.setQueryData<LxdReplicator>(
      detailQueryKey,
      (currentReplicator) => {
        if (!currentReplicator) {
          return currentReplicator;
        }

        return {
          ...currentReplicator,
          last_run_error: errorMsg,
        };
      },
    );
  };

  const onSuccess = () => {
    setLoading(false);
    markReplicatorRunning();
    invalidateCache();
    notifySuccess(replicator.name);
  };

  const onOperationSuccess = () => {
    storeRunError(undefined);
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
    storeRunError(msg);
    invalidateCache();
    notify.failure(
      `Replicator ${replicator.name} failed while running`,
      new Error(msg),
    );
  };

  const onFailure = (e: unknown) => {
    setLoading(false);
    invalidateCache();
    notify.failure(`Running replicator ${replicator.name} failed`, e);
  };

  const handleRun = () => {
    setLoading(true);
    runReplicator(
      replicator.name,
      replicator.project,
      isReverseFlow ? "restore" : "start",
    )
      .then((response) => {
        onSuccess();
        eventQueue.set(
          response.metadata.id,
          onOperationSuccess,
          onOperationFailure,
          invalidateCache,
        );
      })
      .catch(onFailure);
  };

  return (
    <ConfirmationButton
      onHoverText={disabledReason()}
      appearance="default"
      className={classnames("u-no-margin has-icon", className)}
      loading={isLoading || isProjectLoading}
      confirmationModalProps={{
        className: "run-replicator-modal",
        title: (
          <>
            Run replicator{" "}
            <ResourceLink
              type="replicator"
              value={replicator.name}
              to={`${ROOT_PATH}/ui/project/${encodeURIComponent(replicator.project)}/replicator/${encodeURIComponent(replicator.name)}`}
            />
          </>
        ),
        children: (
          <>
            <p>
              The project <ProjectRichChip projectName={replicator.project} />{" "}
              is in{" "}
              <strong>{project?.config["replica.mode"] || "unknown"}</strong>{" "}
              mode.
              <br />
              {/* TODO: use new API endpoint to promote/demote a project
              https://github.com/canonical/lxd/pull/18312
              Need to switch to standby ?{" "}
              <Link
                to={`${ROOT_PATH}/ui/project/${encodeURIComponent(replicator.project)}/replicator/${encodeURIComponent(replicator.name)}`}
              >
                Change mode
              </Link> */}
            </p>

            <div
              className={classnames("replicator-data-flow u-hide--small", {
                "replicator-data-flow--reverse": isReverseFlow,
              })}
            >
              <div className="replicator-data-flow__node replicator-data-flow__source">
                <span className="node-heading u-text--muted">
                  {isReverseFlow ? "standby" : "leader"} project (local)
                </span>
                <ProjectRichChip projectName={replicator.project} />
              </div>

              <div className="replicator-data-flow__arrow-shaft">
                <ClusterLinkRichChip clusterLink={clusterLink} />
              </div>

              <div className="replicator-data-flow__node replicator-data-flow__target">
                <span className="node-heading u-text--muted">
                  {isReverseFlow ? "leader" : "standby"} project (remote)
                </span>
                <strong className="mono-font">{replicator.project}</strong>
              </div>
            </div>

            {isReverseFlow ? (
              <p>
                This will sync all instances from the{" "}
                <ClusterLinkRichChip clusterLink={clusterLink} /> cluster back
                to the
                <ProjectRichChip projectName={replicator.project} /> project.
              </p>
            ) : (
              <p>
                This will sync all instances in the source project{" "}
                <ProjectRichChip projectName={replicator.project} /> to the
                standby cluster{" "}
                <ClusterLinkRichChip clusterLink={clusterLink} />.
              </p>
            )}

            {isReverseFlow && (
              <Notification
                severity="caution"
                messageElement="div"
                title="This operation will synchronize instances from the remote cluster to this project."
              >
                <p>
                  All current local data will be overwritten by the remote
                  version.
                </p>
              </Notification>
            )}
          </>
        ),
        onConfirm: handleRun,
        confirmButtonLabel: buttonLabel,
        close: onClose,
      }}
      disabled={Boolean(disabledReason())}
    >
      <Icon name="play" />
      <span>{buttonLabel}</span>
    </ConfirmationButton>
  );
};

export default RunReplicatorBtn;
