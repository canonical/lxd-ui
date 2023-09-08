import React, { FC, useState } from "react";
import { deleteInstance } from "api/instances";
import { LxdInstance } from "types/instance";
import { useNavigate } from "react-router-dom";
import ItemName from "components/ItemName";
import { deletableStatuses } from "util/instanceDelete";
import { useDeleteIcon } from "context/useDeleteIcon";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import classnames from "classnames";

interface Props {
  instance: LxdInstance;
}

const DeleteInstanceBtn: FC<Props> = ({ instance }) => {
  const isDeleteIcon = useDeleteIcon();
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    setLoading(true);
    deleteInstance(instance)
      .then(() => {
        navigate(
          `/ui/project/${instance.project}/instances`,
          notify.queue(notify.success(`Instance ${instance.name} deleted.`))
        );
      })
      .catch((e) => {
        notify.failure(
          "Instance deletion failed",
          e,
          <>
            Instance <ItemName item={instance} bold />:
          </>
        );
      })
      .finally(() => setLoading(false));
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
          <>
            This will permanently delete instance{" "}
            <ItemName item={instance} bold />.<br />
            This action cannot be undone, and can result in data loss.
          </>
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
