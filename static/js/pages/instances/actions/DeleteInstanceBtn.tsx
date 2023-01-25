import React, { FC, useState } from "react";
import { deleteInstance } from "api/instances";
import { LxdInstance } from "types/instance";
import { NotificationHelper } from "types/notification";
import ConfirmationButton from "components/ConfirmationButton";
import { Tooltip } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";

interface Props {
  instance: LxdInstance;
  notify: NotificationHelper;
}

const DeleteInstanceBtn: FC<Props> = ({ instance, notify }) => {
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    setLoading(true);
    deleteInstance(instance.name)
      .then(() => {
        setLoading(false);
        navigate(
          "/ui/instances",
          notify.queue(notify.success(`Instance ${instance.name} deleted.`))
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Error on instance delete.", e);
      });
  };

  const isDisabled = isLoading || instance.status !== "Stopped";

  return (
    <Tooltip
      message={isDisabled ? "Instance must be stopped" : undefined}
      position="btm-center"
    >
      <ConfirmationButton
        className="u-no-margin--bottom"
        isLoading={isLoading}
        iconClass="p-icon--delete"
        iconDescription="Delete"
        title="Confirm delete"
        toggleCaption="Delete"
        confirmationMessage={`Are you sure you want to delete instance "${instance.name}"? This action cannot be undone, and can result in data loss.`}
        posButtonLabel="Delete"
        onConfirm={handleDelete}
        isDense={false}
        isDisabled={isDisabled}
      />
    </Tooltip>
  );
};

export default DeleteInstanceBtn;
