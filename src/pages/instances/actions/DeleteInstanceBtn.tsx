import type { FC } from "react";
import { useState } from "react";
import { deleteInstance, stopInstance } from "api/instances";
import type { LxdInstance } from "types/instance";
import { useNavigate } from "react-router-dom";
import { deletableStatuses } from "util/instanceDelete";
import {
  ConfirmationButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import classnames from "classnames";
import { useEventQueue } from "context/eventQueue";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useInstanceLoading } from "context/instanceLoading";
import ResourceLabel from "components/ResourceLabel";
import InstanceLinkChip from "../InstanceLinkChip";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { isInstanceFrozen, isInstanceRunning } from "util/instanceStatus";
import { Notification } from "@canonical/react-components";
import ConfirmationForce from "components/ConfirmationForce";

interface Props {
  instance: LxdInstance;
  classname?: string;
  onClose?: () => void;
  label?: string;
}

const DeleteInstanceBtn: FC<Props> = ({
  instance,
  classname,
  onClose,
  label = "Delete",
}) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const instanceLoading = useInstanceLoading();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { canDeleteInstance } = useInstanceEntitlements();
  const [isForce, setForce] = useState(false);

  const isRunningOrFrozen =
    isInstanceRunning(instance) || isInstanceFrozen(instance);

  const doDelete = () => {
    const instanceLink = <InstanceLinkChip instance={instance} />;

    deleteInstance(instance)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.projects, instance.project],
            });
            navigate(
              `/ui/project/${encodeURIComponent(instance.project)}/instances`,
            );
            toastNotify.success(
              <>
                Instance{" "}
                <ResourceLabel
                  bold
                  type={instance.type}
                  value={instance.name}
                />{" "}
                deleted.
              </>,
            );
          },
          (msg) =>
            toastNotify.failure(
              "Instance deletion failed",
              new Error(msg),
              instanceLink,
            ),
          () => {
            setLoading(false);
          },
        );
      })
      .catch((e) => {
        toastNotify.failure("Instance deletion failed", e, instanceLink);
        setLoading(false);
      });
  };

  const handleDelete = () => {
    if (isRunningOrFrozen && !isForce) {
      return;
    }

    setLoading(true);

    if (isRunningOrFrozen) {
      const instanceLink = <InstanceLinkChip instance={instance} />;

      stopInstance(instance, true)
        .then((operation) => {
          eventQueue.set(operation.metadata.id, doDelete, (msg) => {
            toastNotify.failure(
              "Instance stop failed",
              new Error(msg),
              instanceLink,
            );
            setLoading(false);
          });
        })
        .catch((e) => {
          toastNotify.failure("Instance stop failed", e, instanceLink);
          setLoading(false);
        });
    } else {
      doDelete();
    }
  };

  const isDeletableStatus = deletableStatuses.includes(instance.status);
  const isDisabled =
    isLoading ||
    !isDeletableStatus ||
    instanceLoading.getType(instance) === "Migrating" ||
    !canDeleteInstance(instance);
  const getHoverText = () => {
    if (!canDeleteInstance(instance)) {
      return "You do not have permission to delete this instance";
    }
    if (!isDeletableStatus) {
      return "Stop the instance to delete it";
    }
    return "Delete instance";
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      appearance="default"
      className={classnames("u-no-margin--bottom has-icon", classname)}
      loading={isLoading}
      confirmationModalProps={{
        close: () => {
          setForce(false);
          onClose?.();
        },
        title: "Confirm delete",
        children: (
          <div>
            This will permanently delete instance{" "}
            <ResourceLabel type={instance.type} value={instance.name} bold />.
            <br />
            This action cannot be undone, and can result in data loss.
            {isRunningOrFrozen && (
              <>
                <br />
                <br />
                <Notification
                  severity="caution"
                  title={`The instance is currently ${isInstanceFrozen(instance) ? "frozen" : "running"}.`}
                >
                  Confirm to force delete it.
                </Notification>
              </>
            )}
          </div>
        ),
        onConfirm: handleDelete,
        confirmButtonLabel: "Delete",
        confirmExtra: isRunningOrFrozen ? (
          <ConfirmationForce label="Force delete" force={[isForce, setForce]} />
        ) : undefined,
        confirmButtonDisabled: isRunningOrFrozen && !isForce,
      }}
      disabled={isDisabled || isLoading}
      shiftClickEnabled={!isRunningOrFrozen}
      showShiftClickHint={!isRunningOrFrozen}
    >
      <Icon name="delete" />
      {label && <span>{label}</span>}
    </ConfirmationButton>
  );
};

export default DeleteInstanceBtn;
