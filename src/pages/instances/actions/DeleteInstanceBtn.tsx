import { FC, useState } from "react";
import { deleteInstance } from "api/instances";
import type { LxdInstance } from "types/instance";
import { useNavigate } from "react-router-dom";
import ItemName from "components/ItemName";
import { deletableStatuses } from "util/instanceDelete";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import classnames from "classnames";
import { useEventQueue } from "context/eventQueue";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useToastNotification } from "context/toastNotificationProvider";
import { useInstanceLoading } from "context/instanceLoading";
import ResourceLabel from "components/ResourceLabel";
import InstanceLinkChip from "../InstanceLinkChip";

interface Props {
  instance: LxdInstance;
  classname?: string;
  onClose?: () => void;
}

const DeleteInstanceBtn: FC<Props> = ({ instance, classname, onClose }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const instanceLoading = useInstanceLoading();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    setLoading(true);
    const instanceLink = <InstanceLinkChip instance={instance} />;

    void deleteInstance(instance)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            void queryClient.invalidateQueries({
              queryKey: [queryKeys.projects, instance.project],
            });
            void navigate(`/ui/project/${instance.project}/instances`);
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
          () => setLoading(false),
        );
      })
      .catch((e) => {
        toastNotify.failure("Instance deletion failed", e, instanceLink);
        setLoading(false);
      });
  };

  const isDeletableStatus = deletableStatuses.includes(instance.status);
  const isDisabled =
    isLoading ||
    !isDeletableStatus ||
    instanceLoading.getType(instance) === "Migrating";
  const getHoverText = () => {
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
        close: onClose,
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
      <Icon name="delete" />
      <span>Delete</span>
    </ConfirmationButton>
  );
};

export default DeleteInstanceBtn;
