import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import {
  ConfirmationButton,
  Icon,
  Notification,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { deleteReplicator } from "api/replicators";
import ResourceLabel from "components/ResourceLabel";
import type { LxdReplicator } from "types/replicator";
import { useReplicatorEntitlements } from "util/entitlements/replicators";
import { queryKeys } from "util/queryKeys";
import { ROOT_PATH } from "util/rootPath";
import classNames from "classnames";

interface Props {
  replicator: LxdReplicator;
  className?: string;
  onClose?: () => void;
  hasLabel?: boolean;
}

const DeleteReplicatorBtn: FC<Props> = ({
  replicator,
  className,
  onClose,
  hasLabel = false,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const { canDeleteReplicator } = useReplicatorEntitlements();
  const isReplicatorRunning = replicator.last_run_status === "Running";

  const disabledReason = () => {
    if (!canDeleteReplicator(replicator)) {
      return "You do not have permission to delete this replicator";
    }

    return undefined;
  };

  const notifySuccess = (replicatorName: string) => {
    toastNotify.success(
      <>
        Replicator{" "}
        <ResourceLabel bold type="replicator" value={replicatorName} /> deleted.
      </>,
    );
  };

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[2] === queryKeys.replicators,
    });
  };

  const onSuccess = () => {
    invalidateCache();

    // Only navigate to the replicators list if we are still on the deleted replicator's detail page
    const replicatorDetailPath = `${ROOT_PATH}/ui/project/${encodeURIComponent(replicator.project)}/replicator/${encodeURIComponent(replicator.name)}`;
    if (location.pathname.startsWith(replicatorDetailPath)) {
      navigate(`${ROOT_PATH}/ui/cluster/replicators`);
    }

    notifySuccess(replicator.name);
  };

  const onFailure = (e: unknown) => {
    invalidateCache();
    setLoading(false);
    notify.failure(`Deleting replicator ${replicator.name} failed`, e);
  };

  const handleDelete = () => {
    setLoading(true);
    deleteReplicator(replicator.name, replicator.project)
      .then(onSuccess)
      .catch(onFailure);
  };

  return (
    <ConfirmationButton
      onHoverText={disabledReason()}
      appearance={hasLabel ? "default" : "base"}
      className={classNames("u-no-margin--bottom has-icon", className, {
        "is-dense": !hasLabel,
      })}
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <>
            <p>
              This will permanently delete replicator{" "}
              <ResourceLabel type="replicator" value={replicator.name} bold />.
            </p>
            <p>Scheduled refreshes to the standby cluster will stop.</p>
            <p>
              Instances on the standby cluster remain available, but they will
              no longer receive updates.
            </p>
            {isReplicatorRunning && (
              <Notification
                severity="caution"
                title="Replicator is currently running."
              >
                This replicator is actively transferring data. Deleting it now
                will not cancel ongoing instance refresh operations.
              </Notification>
            )}
          </>
        ),
        onConfirm: handleDelete,
        confirmButtonLabel: "Delete",
        close: onClose,
      }}
      disabled={Boolean(disabledReason()) || isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="delete" />
      {hasLabel && <span>Delete</span>}
    </ConfirmationButton>
  );
};

export default DeleteReplicatorBtn;
