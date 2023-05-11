import React, { FC, useState } from "react";
import { deleteInstance } from "api/instances";
import { LxdInstance } from "types/instance";
import ConfirmationButton from "components/ConfirmationButton";
import { useNavigate } from "react-router-dom";
import { useNotify } from "context/notify";
import ItemName from "components/ItemName";
import { deletableStatuses } from "util/instanceDelete";

interface Props {
  instance: LxdInstance;
}

const DeleteInstanceBtn: FC<Props> = ({ instance }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    setLoading(true);
    deleteInstance(instance)
      .then(() => {
        navigate(
          `/ui/${instance.project}/instances`,
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

  const isDisabled = isLoading || !deletableStatuses.includes(instance.status);

  return (
    <ConfirmationButton
      onHoverText="Delete instance"
      toggleAppearance="base"
      className="delete-instance-btn"
      isLoading={isLoading}
      icon="delete"
      title="Confirm delete"
      confirmMessage={
        <>
          Are you sure you want to delete instance{" "}
          <ItemName item={instance} bold />?{"\n"}This action cannot be undone,
          and can result in data loss.
        </>
      }
      confirmButtonLabel="Delete"
      onConfirm={handleDelete}
      isDisabled={isDisabled}
      isDense
    />
  );
};

export default DeleteInstanceBtn;
