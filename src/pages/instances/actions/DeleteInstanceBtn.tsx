import React, { FC, useState } from "react";
import { deleteInstance } from "api/instances";
import { LxdInstance } from "types/instance";
import ConfirmationButton from "components/ConfirmationButton";
import { useNavigate } from "react-router-dom";
import { useNotify } from "context/notify";

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
        setLoading(false);
        navigate(
          `/ui/${instance.project}/instances`,
          notify.queue(notify.success(`Instance ${instance.name} deleted.`))
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure(`Error deleting instance ${instance.name}.`, e);
      });
  };

  const isDisabled = isLoading || instance.status !== "Stopped";

  return (
    <ConfirmationButton
      toggleAppearance="base"
      className="delete-instance-btn"
      isLoading={isLoading}
      icon="delete"
      title="Confirm delete"
      confirmationMessage={`Are you sure you want to delete instance "${instance.name}"? This action cannot be undone, and can result in data loss.`}
      posButtonLabel="Delete"
      onConfirm={handleDelete}
      isDense={true}
      isDisabled={isDisabled}
    />
  );
};

export default DeleteInstanceBtn;
