import { FC, useState } from "react";
import { deleteInstance } from "api/instances";
import { LxdInstance } from "types/instance";
import { useNavigate } from "react-router-dom";
import ItemName from "components/ItemName";
import { deletableStatuses } from "util/instanceDelete";
import { useDeleteIcon } from "context/useDeleteIcon";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import classnames from "classnames";
import { useEventQueue } from "context/eventQueue";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useToastNotification } from "context/toastNotificationProvider";
import InstanceLink from "pages/instances/InstanceLink";

interface Props {
  instance: LxdInstance;
}

const DeleteInstanceBtn: FC<Props> = ({ instance }) => {
  const eventQueue = useEventQueue();
  const isDeleteIcon = useDeleteIcon();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    setLoading(true);
    void deleteInstance(instance)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            void queryClient.invalidateQueries({
              queryKey: [queryKeys.projects, instance.project],
            });
            navigate(`/ui/project/${instance.project}/instances`);
            toastNotify.success(`Instance ${instance.name} deleted.`);
          },
          (msg) =>
            toastNotify.failure(
              "Instance deletion failed",
              new Error(msg),
              <InstanceLink instance={instance} />,
            ),
          () => setLoading(false),
        );
      })
      .catch((e) => {
        toastNotify.failure(
          "Instance deletion failed",
          e,
          <InstanceLink instance={instance} />,
        );
        setLoading(false);
      });
  };

  const isDeletableStatus = deletableStatuses.includes(instance.status);
  const isDisabled = isLoading || !isDeletableStatus;
  const getHoverText = () => {
    if (!isDeletableStatus) {
      return "Stop the instance to delete it";
    }
    return "Delete instance";
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      appearance={isDeleteIcon ? "base" : "default"}
      className={classnames("u-no-margin--bottom", {
        "has-icon": isDeleteIcon,
      })}
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete instance{" "}
            <ItemName item={instance} bold />.<br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        onConfirm: handleDelete,
        confirmButtonLabel: "Delete",
      }}
      disabled={isDisabled}
      shiftClickEnabled
      showShiftClickHint
    >
      {isDeleteIcon && <Icon name="delete" />}
      {!isDeleteIcon && <span>Delete instance</span>}
    </ConfirmationButton>
  );
};

export default DeleteInstanceBtn;
