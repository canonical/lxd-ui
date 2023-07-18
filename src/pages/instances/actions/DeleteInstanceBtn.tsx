import React, { FC, useState } from "react";
import { deleteInstance } from "api/instances";
import { LxdInstance } from "types/instance";
import ConfirmationButton from "components/ConfirmationButton";
import { useNavigate } from "react-router-dom";
import ItemName from "components/ItemName";
import { deletableStatuses } from "util/instanceDelete";
import { useDeleteIcon } from "context/useDeleteIcon";
import { useNotify } from "@canonical/react-components";

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
      toggleAppearance={isDeleteIcon ? "base" : "default"}
      className="u-no-margin--bottom"
      isLoading={isLoading}
      title="Confirm delete"
      toggleCaption={isDeleteIcon ? undefined : "Delete instance"}
      confirmMessage={
        <>
          This will permanently delete instance{" "}
          <ItemName item={instance} bold />.{"\n"}This action cannot be undone,
          and can result in data loss.
        </>
      }
      confirmButtonLabel="Delete"
      onConfirm={handleDelete}
      isDisabled={isDisabled}
      isDense={false}
      icon={isDeleteIcon ? "delete" : undefined}
    />
  );
};

export default DeleteInstanceBtn;
